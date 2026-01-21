import { Request, Response, NextFunction } from "express";
import sequelize from "../config/dbConfig";
import TabelaFinal from "../models/tabelaFinal.model";
import Insumos from "../models/insumos.model";
import ListaEspera from "../models/listaEspera.model";
import User from "../models/user.model";
import { tabelaFinalBodySchema, TabelaFinalBodyDto } from "../schemas/tabelaFinal/tabelaFinal.schema";

export const createTabelaFinal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto: TabelaFinalBodyDto = tabelaFinalBodySchema.parse(req.body);

    if (!req.currentUser) {
      res.status(401).json({ error: "Usuário não autenticado" });
      return;
    }

    let receptor_nome: string | null = null;
    if (dto.cpf) {
      const funcionario = await User.findOne({
        where: { cpf: dto.cpf },
        raw: true,
      });
      if (!funcionario) {
        res
          .status(403)
          .json({ error: "CPF não corresponde a nenhum registro válido" });
        return;
      }
      receptor_nome = (funcionario as any).nome;
    }

    const transaction = await sequelize.transaction();
    try {
      for (const produtoData of dto.produtos) {
        const codParts = String(produtoData.Insumo_e_SubInsumo_Cod || "")
          .split("-")
          .map((s) => s.trim());
        const insumoCod = codParts[0];
        const subinsumoCod =
          codParts.length >= 2 && codParts[1] !== "" ? codParts[1] : null;

        const produto = await Insumos.findOne({
          where: {
            Insumo_Cod: Number(insumoCod),
            SubInsumo_Cod: subinsumoCod ? Number(subinsumoCod) : null,
          },
          transaction,
        });

        if (!produto) {
          await transaction.rollback();
          res.status(404).json({
            error: `Produto não encontrado para o código '${produtoData.Insumo_e_SubInsumo_Cod}'`,
          });
          return;
        }

        const itemData: any = {
          Centro_Negocio_Cod: (produtoData.Centro_Negocio_Cod || "").trim(),
          Insumo_e_SubInsumo_Cod: produtoData.Insumo_e_SubInsumo_Cod,
          Num_Doc: produtoData.codigo_pedido
            ? Number(produtoData.codigo_pedido)
            : 0,
          Tipo_Doc: produtoData.Tipo_Doc || "ND",
          quantidade: produtoData.quantidade,
          destino: produtoData.destino,
          Observacao: produtoData.Observacao,
          almoxarife_nome: produtoData.almoxarife_nome,
          receptor_nome: receptor_nome,
        };

        await TabelaFinal.create(itemData, { transaction });

        // Remove from lista_espera if exists
        await ListaEspera.destroy({
          where: {
            Insumo_Cod: Number(insumoCod),
            SubInsumo_Cod: subinsumoCod ? Number(subinsumoCod) : null,
          },
          transaction,
        });
      }

      await transaction.commit();

      res
        .status(201)
        .json({ detail: "Itens adicionados com sucesso!", employee_name: receptor_nome });
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  } catch (err) {
    next(err);
  }
};

export default createTabelaFinal;

