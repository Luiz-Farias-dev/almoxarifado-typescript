import { Request, Response, NextFunction } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { parse as csvParse } from "csv-parse/sync";
import chardet from "jschardet";
import iconv from "iconv-lite";
import { Op } from "sequelize";

import SubInsumo from "../models/subInsumo.model";
import {
  produtoBaseBodySchema,
  ProdutoBaseBodyDto,
} from "../schemas/produtoCatalogo/produtoCatalogo.schema";
import {
  produtoResponseSchema,
  ProdutoResponseDto,
  getAllProdutosResponseSchema,
  GetAllProdutosResponseDto,
  uploadResumoResponseSchema,
  UploadResumoResponseDto,
} from "../schemas/produtoCatalogo/produtoCatalogo.response";

/** ====== POST /upload-produtos-catalogo ====== */
export const uploadProdutosCatalogo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file?.originalname) {
    res.status(400).json({ error: "Arquivo é obrigatório no campo 'file'." });
    return;
  }

  const name = file.originalname.toLowerCase();
  const isXlsx = name.endsWith(".xlsx");
  const isCsv = name.endsWith(".csv");

  if (!isXlsx && !isCsv) {
    res
      .status(400)
      .json({
        error: "Apenas arquivos Excel (.xlsx) ou CSV (.csv) são permitidos.",
      });
    return;
  }

  const fileType: "CSV" | "Excel" = isCsv ? "CSV" : "Excel";

  try {
    /** 1) Ler arquivo -> rows */
    let rows: Record<string, any>[] = [];

    if (isXlsx) {
      const wb = XLSX.read(file.buffer, { type: "buffer" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(ws, { defval: "" }) as Record<
        string,
        any
      >[];
    } else {
      const { encoding, delimiter } = detectarEncodingEDelimitador(file.buffer);

      let decoded = "";
      try {
        decoded = iconv.decode(file.buffer, encoding);
      } catch {
        decoded = file.buffer.toString("utf-8");
      }

      try {
        rows = csvParse(decoded, {
          columns: true,
          delimiter,
          skip_empty_lines: true,
          relax_column_count: true,
          trim: true,
          bom: true,
        });
      } catch {
        // fallback simples
        const attempts: Array<{
          enc: BufferEncoding | "latin1";
          delim: string;
        }> = [
          { enc: "utf-8", delim: "," },
          { enc: "latin1", delim: "," },
          { enc: "utf-8", delim: ";" },
          { enc: "latin1", delim: ";" },
        ];

        let ok = false;
        for (const a of attempts) {
          try {
            const d = file.buffer.toString(
              a.enc === "latin1" ? "latin1" : a.enc
            );
            rows = csvParse(d, {
              columns: true,
              delimiter: a.delim,
              skip_empty_lines: true,
              trim: true,
              bom: true,
            });
            ok = rows.length > 0;
            if (ok) break;
          } catch {}
        }

        if (!ok) {
          res
            .status(400)
            .json({
              error:
                "Não foi possível ler o CSV. Verifique o formato/codificação.",
            });
          return;
        }
      }
    }

    if (!rows.length) {
      res.status(400).json({ error: "O arquivo está vazio." });
      return;
    }

    /** 2) Mapear colunas */
    let mappedRows = rows.map((r) => renameRowKeys(r, columnMapping));

    /** 3) Insumo_ItemObsoleto -> INSUMO_ITEMOBSOLETO */
    mappedRows = mappedRows.map((r) => {
      if (
        r.Insumo_ItemObsoleto !== undefined &&
        r.INSUMO_ITEMOBSOLETO === undefined
      ) {
        r.INSUMO_ITEMOBSOLETO = r.Insumo_ItemObsoleto;
        delete r.Insumo_ItemObsoleto;
      }
      return r;
    });

    const columns = new Set(Object.keys(mappedRows[0] ?? {}));

    const hasInsumoCodigo = columns.has("Insumo_Codigo");
    const hasSeparateCodes =
      columns.has("Insumo_Cod") && columns.has("SubInsumo_Cod");
    const hasInsumoEspecificacao = columns.has("Insumo_Especificacao");
    const hasSubEspecificacao = columns.has("SubInsumo_Especificacao");

    if (!hasInsumoCodigo && !hasSeparateCodes) {
      res.status(400).json({
        error:
          "É necessário ter 'Insumo_Codigo' OU 'Insumo_Cod' e 'SubInsumo_Cod'.",
        colunas_encontradas: Array.from(columns),
      });
      return;
    }

    if (!hasInsumoEspecificacao && !hasSubEspecificacao) {
      res.status(400).json({
        error:
          "É necessário ter 'Insumo_Especificacao' OU 'SubInsumo_Especificacao'.",
        colunas_encontradas: Array.from(columns),
      });
      return;
    }

    for (const required of ["Unid_Cod", "INSUMO_ITEMOBSOLETO"]) {
      if (!columns.has(required)) {
        res.status(400).json({
          error: `Coluna obrigatória faltando: ${required}`,
          colunas_encontradas: Array.from(columns),
        });
        return;
      }
    }

    /** 4) Insumo_Codigo -> Insumo_Cod/SubInsumo_Cod */
    if (hasInsumoCodigo) {
      mappedRows = mappedRows.map((r) => {
        const { insumo, sub } = separarCodigo(r.Insumo_Codigo);
        r.Insumo_Cod = insumo;
        r.SubInsumo_Cod = sub;
        delete r.Insumo_Codigo;
        return r;
      });
    }

    /** 5) Insumo_Especificacao -> SubInsumo_Especificacao */
    if (hasInsumoEspecificacao) {
      mappedRows = mappedRows.map((r) => {
        r.SubInsumo_Especificacao = r.Insumo_Especificacao;
        delete r.Insumo_Especificacao;
        return r;
      });
    }

    /** 6) Limpeza + normalização */
    const cleaned = mappedRows
      .map((r) => ({
        Insumo_Cod: r.Insumo_Cod != null ? String(r.Insumo_Cod).trim() : null,
        SubInsumo_Cod:
          r.SubInsumo_Cod != null && String(r.SubInsumo_Cod).trim() !== ""
            ? String(r.SubInsumo_Cod).trim()
            : null,
        Unid_Cod:
          r.Unid_Cod != null && String(r.Unid_Cod).trim() !== ""
            ? String(r.Unid_Cod).trim()
            : null,
        SubInsumo_Especificacao:
          r.SubInsumo_Especificacao != null
            ? String(r.SubInsumo_Especificacao).trim()
            : null,
        INSUMO_ITEMOBSOLETO: normalizeObsoleto(r.INSUMO_ITEMOBSOLETO),
      }))
      .filter((r) => !!r.Insumo_Cod && !!r.SubInsumo_Especificacao) as Array<{
      Insumo_Cod: string;
      SubInsumo_Cod: string | null;
      Unid_Cod: string | null;
      SubInsumo_Especificacao: string;
      INSUMO_ITEMOBSOLETO: string;
    }>;

    /** 7) Dedupe no payload */
    const uniqueMap = new Map<string, (typeof cleaned)[number]>();
    for (const r of cleaned) {
      const key = `${r.Insumo_Cod}::${r.SubInsumo_Cod ?? "NULL"}::${r.SubInsumo_Especificacao}`;
      if (!uniqueMap.has(key)) uniqueMap.set(key, r);
    }
    const uniqueRows = Array.from(uniqueMap.values());

    /** 8) Checar existentes em lotes */
    const batchSize = 500;
    const existingSet = new Set<string>();

    for (let i = 0; i < uniqueRows.length; i += batchSize) {
      const batch = uniqueRows.slice(i, i + batchSize);

      const orConditions = batch.map((b) => ({
        Insumo_Cod: b.Insumo_Cod,
        SubInsumo_Cod: b.SubInsumo_Cod,
        SubInsumo_Especificacao: b.SubInsumo_Especificacao,
      }));

      const existing = await SubInsumo.findAll({
        attributes: ["Insumo_Cod", "SubInsumo_Cod", "SubInsumo_Especificacao"],
        where: { [Op.or]: orConditions },
        raw: true,
      });

      for (const e of existing as any[]) {
        const key = `${String(e.Insumo_Cod)}::${e.SubInsumo_Cod ?? "NULL"}::${String(e.SubInsumo_Especificacao)}`;
        existingSet.add(key);
      }
    }

    const newRecords = uniqueRows.filter((r) => {
      const key = `${r.Insumo_Cod}::${r.SubInsumo_Cod ?? "NULL"}::${r.SubInsumo_Especificacao}`;
      return !existingSet.has(key);
    });

    if (!newRecords.length) {
      const dto: UploadResumoResponseDto = uploadResumoResponseSchema.parse({
        message:
          "Nenhum novo registro para adicionar. Todos os registros já existem no banco de dados.",
        total_rows: uniqueRows.length,
        new_rows: 0,
        ignored_rows: uniqueRows.length,
        file_type: fileType,
      });
      res.status(200).json(dto);
      return;
    }

    /** 9) Insert em lotes */
    for (let i = 0; i < newRecords.length; i += batchSize) {
      const batch = newRecords.slice(i, i + batchSize);
      await SubInsumo.bulkCreate(batch as any[]);
    }

    /** 10) SQL de limpeza de duplicados (Postgres) */
    try {
      await (SubInsumo.sequelize as any).query(`
        DELETE FROM "SubInsumo"
        WHERE id NOT IN (
          SELECT MIN(id)
          FROM "SubInsumo"
          GROUP BY "Insumo_Cod", "SubInsumo_Cod", "SubInsumo_Especificacao"
        );
      `);
    } catch (e) {
      console.error("Erro ao executar script de limpeza de duplicados:", e);
    }

    const total_rows = uniqueRows.length;
    const new_rows = newRecords.length;
    const ignored_rows = total_rows - new_rows;

    const processamento: string[] = [];
    if (hasInsumoCodigo)
      processamento.push("Insumo_Codigo separado automaticamente");
    if (hasInsumoEspecificacao)
      processamento.push(
        "Insumo_Especificacao convertida para SubInsumo_Especificacao"
      );

    const dto: UploadResumoResponseDto = uploadResumoResponseSchema.parse({
      message: `Processamento concluído. ${new_rows} novos registros adicionados, ${ignored_rows} ignorados (já existiam). Limpeza de duplicados executada.`,
      total_rows,
      new_rows,
      ignored_rows,
      file_type: fileType,
      processamento_aplicado: processamento.join(", "),
    });

    res.status(200).json(dto);
  } catch (err) {
    console.error("Erro no upload:", err);
    res.status(500).json({ error: "Erro ao processar o arquivo" });
  }
};

/** ====== POST /upload-produto-catalogo ====== */
export const uploadProdutoCatalogo = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const dto: ProdutoBaseBodyDto = produtoBaseBodySchema.parse(req.body);

  const payload = {
    ...dto,
    SubInsumo_Cod: dto.SubInsumo_Cod ?? null,
    Unid_Cod: dto.Unid_Cod ?? null,
    INSUMO_ITEMOBSOLETO: normalizeObsoleto(dto.INSUMO_ITEMOBSOLETO),
  };

  SubInsumo.findOne({
    where: {
      Insumo_Cod: payload.Insumo_Cod,
      SubInsumo_Especificacao: payload.SubInsumo_Especificacao,
    },
    raw: true,
  })
    .then((exists) => {
      if (exists) {
        res.status(400).json({ error: "Produto já cadastrado" });
        return;
      }

      return SubInsumo.create(payload as any);
    })
    .then((created: any) => {
      if (!created) return;

      const response: ProdutoResponseDto = produtoResponseSchema.parse(
        created.get({ plain: true })
      );
      res.status(201).json(response);
    })
    .catch((err) => {
      console.error("Erro ao criar produto:", err);
      res.status(500).json({ error: "Erro ao criar produto" });
    });
};

/** ====== GET /catalogo-produtos ====== */
export const getCatalogoProdutos = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const skip = Number(req.query.skip ?? 0);
  const limit = Number(req.query.limit ?? 100);

  if (!Number.isInteger(skip) || skip < 0) {
    res
      .status(400)
      .json({ error: "O valor de skip deve ser maior ou igual a 0" });
    return;
  }
  if (!Number.isInteger(limit) || limit < 1) {
    res
      .status(400)
      .json({ error: "O valor de limit deve ser maior ou igual a 1" });
    return;
  }

  const SubInsumo_Especificacao = req.query.SubInsumo_Especificacao as
    | string
    | undefined;
  const Insumo_Cod = req.query.Insumo_Cod as string | undefined;
  const INSUMO_ITEMOBSOLETO = req.query.INSUMO_ITEMOBSOLETO as
    | string
    | undefined;

  const where: any = {};

  // Postgres: ILIKE => Op.iLike
  if (SubInsumo_Especificacao)
    where.SubInsumo_Especificacao = {
      [Op.iLike]: `%${SubInsumo_Especificacao}%`,
    };
  if (Insumo_Cod) where.Insumo_Cod = Insumo_Cod;
  if (INSUMO_ITEMOBSOLETO)
    where.INSUMO_ITEMOBSOLETO = { [Op.iLike]: `%${INSUMO_ITEMOBSOLETO}%` };

  SubInsumo.findAll({
    where,
    offset: skip,
    limit,
    attributes: [
      "id",
      "Insumo_Cod",
      "SubInsumo_Cod",
      "Unid_Cod",
      "SubInsumo_Especificacao",
      "INSUMO_ITEMOBSOLETO",
    ],
    raw: true,
  })
    .then((items) => {
      if (!items.length) {
        res.status(404).json({ error: "Nenhum item encontrado" });
        return;
      }

      const dto: GetAllProdutosResponseDto =
        getAllProdutosResponseSchema.parse(items);
      res.status(200).json(dto);
    })
    .catch((err) => {
      console.error("Erro ao buscar catálogo:", err);
      res.status(500).json({ error: "Erro ao buscar catálogo" });
    });
};
