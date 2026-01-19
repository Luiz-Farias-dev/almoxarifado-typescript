import { Request, Response, NextFunction } from "express";
import { Op, literal } from "sequelize";
import ListaEspera from "../models/listaEspera.model";
import CentroCusto from "../models/centroCusto.model";
import Insumos from "../models/insumos.model";
import sequelize from "../config/dbConfig";
import {
  createListaEsperaBodySchema,
  CreateListaEsperaBodyDto,
  getListaEsperaQuerySchema,
  GetListaEsperaQueryDto,
} from "../schemas/listaEspera/listaEspera.schema";
import {
  listaEsperaResponseSchema,
  ListaEsperaResponseDto,
  getAllListaEsperaResponseSchema,
  GetAllListaEsperaResponseDto,
  createListaEsperaResponseSchema,
  CreateListaEsperaResponseDto,
} from "../schemas/listaEspera/listaEspera.response";
import {
  generateOrderNumberOptimized,
  ccCodeOrNameLike,
  ccCodeExprAlt,
} from "../utils/listaEsperaHelpers";
import UserCentroCusto from "../models/userCentroCusto.model";

export const createListaEspera = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto: CreateListaEsperaBodyDto = createListaEsperaBodySchema.parse(
      req.body
    );

    if (!req.currentUser) {
      res.status(401).json({ error: "Usuário não autenticado" });
      return;
    }

    const user = req.currentUser;
    const userTipo = user.tipoFuncionario;
    const userId = user.id;
    const userObraId = user.obraId;

    // Normalize CC data
    const ccCodReq = (dto.centro_custo.Centro_Negocio_Cod || "").trim();
    const ccNameReq = (dto.centro_custo.Centro_Nome || "").trim();

    // Validate CC exists
    const ccRow = await CentroCusto.findOne({
      where: {
        centroNegocioCod: ccCodReq,
      },
    });

    if (!ccRow) {
      res.status(400).json({
        error: `Centro de custo '${ccCodReq}' não existe`,
      });
      return;
    }

    // Authorization logic
    if (userTipo === "Almoxarife") {
      if (!userObraId) {
        res.status(403).json({
          error: "Almoxarife não associado a uma obra",
        });
        return;
      }

      // Verify CC belongs to user's obra
      if ((ccRow as any).obraId !== userObraId) {
        res.status(403).json({
          error: `CC '${ccCodReq}' não pertence à obra do usuário`,
        });
        return;
      }

      // Verify user has permission for this CC
      // Query user_centro_custo association table
      const vinculo = await UserCentroCusto.findOne({
        where: {
          userId: userId,
          obraId: userObraId,
          centroCustoId: (ccRow as any).id,
        },
        raw: true,
      });

      if (!vinculo) {
        res.status(403).json({
          error: `Usuário não possui permissão para o CC '${ccCodReq}'`,
        });
        return;
      }
    } else if (userTipo !== "Administrador") {
      res.status(403).json({ error: "Acesso não autorizado" });
      return;
    }

    const produtos = dto.produtos;
    const codigoPedido = await generateOrderNumberOptimized();

    const createdItems = [];

    // Use transaction for creating multiple records
    const transaction = await sequelize.transaction();

    try {
      for (const produtoData of produtos) {
        const produto = await Insumos.findOne({
          where: {
            Insumo_Cod: produtoData.Insumo_Cod,
            SubInsumo_Especificacao: produtoData.SubInsumo_Especificacao,
          },
          transaction,
        });

        if (!produto) {
          await transaction.rollback();
          res.status(404).json({
            error:
              "Produto não encontrado para o código ou nome fornecido",
          });
          return;
        }

        // Serialize CC data for JSONB field
        const centroCustoDict = {
          Centro_Negocio_Cod: ccCodReq,
          Centro_Nome: ccNameReq || (ccRow as any).nome,
        };

        const dbListaEspera = await ListaEspera.create(
          {
            ...produtoData,
            almoxarifeNome: dto.almoxarife_nome,
            destino: dto.destino,
            centroCusto: centroCustoDict,
            codigo_pedido: codigoPedido,
          },
          { transaction }
        );

        createdItems.push(dbListaEspera);
      }

      await transaction.commit();

      const response: CreateListaEsperaResponseDto =
        createListaEsperaResponseSchema.parse({
          codigo_pedido: codigoPedido,
        });

      res.status(201).json(response);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const readListaEspera = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queryParams: GetListaEsperaQueryDto =
      getListaEsperaQuerySchema.parse(req.query);

    if (!req.currentUser) {
      res.status(401).json({ error: "Usuário não autenticado" });
      return;
    }

    const user = req.currentUser;
    const userTipo = user.tipoFuncionario;
    const userId = user.id;
    const userObraId = user.obraId;

    const { skip, limit, codigo_pedido, destino, centro_custo, Insumo_Cod, Unid_Cod, SubInsumo_Especificacao, work_id } =
      queryParams;

    // Build base query
    const whereClause: any = {};

    // Authorization filtering
    if (userTipo === "Almoxarife") {
      if (!userObraId) {
        res.status(403).json({
          error: "Almoxarife não associado a uma obra",
        });
        return;
      }

      // Get allowed CC codes from user_centro_custo association table
      // First, get the centroCustoIds that the user has access to
      const userCentroCustos = await UserCentroCusto.findAll({
        where: {
          userId: userId,
          obraId: userObraId,
        },
        attributes: ["centroCustoId"],
        raw: true,
      });

      if (!userCentroCustos || userCentroCustos.length === 0) {
        // User has no CCs assigned, return empty array
        const response: GetAllListaEsperaResponseDto =
          getAllListaEsperaResponseSchema.parse([]);
        res.status(200).json(response);
        return;
      }

      const allowedCentroCustoIds = (userCentroCustos as any[]).map(
        (uc) => uc.centroCustoId
      );

      // Get the Centro_Negocio_Cod values for these centroCustoIds
      const centros = await CentroCusto.findAll({
        where: {
          id: {
            [Op.in]: allowedCentroCustoIds,
          },
        },
        attributes: ["centroNegocioCod"],
        raw: true,
      });

      const allowedCodes = (centros as any[])
        .map((c) => c.centroNegocioCod)
        .filter((code) => code != null);

      if (allowedCodes.length === 0) {
        const response: GetAllListaEsperaResponseDto =
          getAllListaEsperaResponseSchema.parse([]);
        res.status(200).json(response);
        return;
      }

      // Filter by CC codes using JSONB expression
      // Escape single quotes in codes to prevent SQL injection
      const escapedCodes = allowedCodes.map((code) =>
        code.replace(/'/g, "''")
      );
      whereClause[Op.or] = escapedCodes.map(
        (code) => literal(`centro_custo->>'Centro_Negocio_Cod' = '${code}'`)
      );
    } else if (userTipo === "Administrador") {
      // Admin can filter by obra if work_id is provided
      if (work_id !== undefined) {
        // Join with CentroCusto to filter by obraId
        // This will be handled in the query options
      }
    } else {
      res.status(403).json({ error: "Acesso não autorizado" });
      return;
    }

    // Additional filters
    if (codigo_pedido !== undefined) {
      whereClause.codigo_pedido = codigo_pedido;
    }

    if (destino) {
      whereClause.destino = {
        [Op.iLike]: `%${destino}%`,
      };
    }

    if (centro_custo) {
      // Use helper function for CC search
      const ccSearchCondition = ccCodeOrNameLike(centro_custo);
      if (whereClause[Op.and]) {
        whereClause[Op.and].push(ccSearchCondition);
      } else {
        whereClause[Op.and] = [ccSearchCondition];
      }
    }

    if (SubInsumo_Especificacao) {
      whereClause.SubInsumo_Especificacao = {
        [Op.iLike]: `%${SubInsumo_Especificacao}%`,
      };
    }

    if (Unid_Cod) {
      whereClause.Unid_Cod = {
        [Op.iLike]: `%${Unid_Cod}%`,
      };
    }

    if (Insumo_Cod !== undefined) {
      whereClause.Insumo_Cod = Insumo_Cod;
    }

    // Build query options
    const queryOptions: any = {
      where: whereClause,
      order: [["id", "DESC"]],
      offset: skip,
      limit: limit,
    };

    // For Admin filtering by obra, use subquery with CentroCusto
    if (userTipo === "Administrador" && work_id !== undefined) {
      // Get CC codes that belong to the specified obra
      const centrosObra = await CentroCusto.findAll({
        where: {
          obraId: work_id,
        },
        attributes: ["centroNegocioCod"],
        raw: true,
      });

      const obraCodes = (centrosObra as any[])
        .map((c) => c.centroNegocioCod)
        .filter((code) => code != null);

      if (obraCodes.length === 0) {
        // No CCs for this obra, return empty array
        const response: GetAllListaEsperaResponseDto =
          getAllListaEsperaResponseSchema.parse([]);
        res.status(200).json(response);
        return;
      }

      // Filter by CC codes using JSONB expression
      const escapedCodes = obraCodes.map((code) =>
        code.replace(/'/g, "''")
      );
      if (whereClause[Op.and]) {
        whereClause[Op.and].push({
          [Op.or]: escapedCodes.map(
            (code) => literal(`centro_custo->>'Centro_Negocio_Cod' = '${code}'`)
          ),
        });
      } else {
        whereClause[Op.and] = [
          {
            [Op.or]: escapedCodes.map(
              (code) => literal(`centro_custo->>'Centro_Negocio_Cod' = '${code}'`)
            ),
          },
        ];
      }
    }

    const listaEspera = await ListaEspera.findAll(queryOptions);

    // Transform to response format
    const responseData = listaEspera.map((item) => {
      const plain = item.toJSON() as any;
      return {
        id: plain.id,
        codigo_pedido: plain.codigo_pedido,
        Insumo_Cod: plain.Insumo_Cod,
        SubInsumo_Cod: plain.SubInsumo_Cod,
        SubInsumo_Especificacao: plain.SubInsumo_Especificacao,
        quantidade: plain.quantidade,
        almoxarifeNome: plain.almoxarifeNome,
        centroCusto: plain.centroCusto,
        Unid_Cod: plain.Unid_Cod,
        destino: plain.destino,
        created_at: plain.created_at,
        updated_at: plain.updated_at,
      };
    });

    const response: GetAllListaEsperaResponseDto =
      getAllListaEsperaResponseSchema.parse(responseData);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteListaEspera = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { codigo_pedido, Insumo_Cod, SubInsumo_Cod } = req.params;

    if (!req.currentUser) {
      res.status(401).json({ error: "Usuário não autenticado" });
      return;
    }

    const user = req.currentUser;
    const userTipo = user.tipoFuncionario;
    const userId = user.id;
    const userObraId = user.obraId;

    // Optional: Apply authorization checks similar to GET
    if (userTipo === "Almoxarife") {
      // Find the item first to check authorization
      const item = await ListaEspera.findOne({
        where: {
          codigo_pedido: codigo_pedido,
          Insumo_Cod: Number(Insumo_Cod),
          SubInsumo_Cod: Number(SubInsumo_Cod),
        },
      });

      if (!item) {
        res.status(404).json({ error: "Item não encontrado" });
        return;
      }

      // Check if user has permission for this CC
      const centroCustoData = (item.toJSON() as any).centroCusto;
      const ccCod = centroCustoData?.Centro_Negocio_Cod;

      if (ccCod) {
        const ccRow = await CentroCusto.findOne({
          where: {
            centroNegocioCod: ccCod,
          },
        });

        if (ccRow && (ccRow as any).obraId === userObraId) {
          // Verify user has permission
          const vinculo = await UserCentroCusto.findOne({
            where: {
              userId: userId,
              obraId: userObraId,
              centroCustoId: (ccRow as any).id,
            },
          });

          if (!vinculo) {
            res.status(403).json({
              error: "Usuário não possui permissão para este item",
            });
            return;
          }
        } else {
          res.status(403).json({
            error: "Item não pertence à obra do usuário",
          });
          return;
        }
      }
    } else if (userTipo !== "Administrador") {
      res.status(403).json({ error: "Acesso não autorizado" });
      return;
    }

    const deleted = await ListaEspera.destroy({
      where: {
        codigo_pedido: codigo_pedido,
        Insumo_Cod: Number(Insumo_Cod),
        SubInsumo_Cod: Number(SubInsumo_Cod),
      },
    });

    if (deleted === 0) {
      res.status(404).json({ error: "Item não encontrado" });
      return;
    }

    res.status(200).json({ detail: "Item removido com sucesso" });
  } catch (error) {
    next(error);
  }
};
