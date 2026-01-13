import { Request, Response, NextFunction, raw } from "express";
import * as XLSX from "xlsx";
import { parse as csvParse } from "csv-parse/sync";
import iconv from "iconv-lite";
import { Op } from "sequelize";

import Insumos from "../models/insumos.model";
import {
  detectarEncodingEDelimitador,
  renomearColunas,
  separarCodigo,
  normalizarObsoleto,
  columnMapping,
} from "../utils/insumosHelpers";
import { produtoBaseSchema } from "../schemas/insumos/insumos.schema";
import {
  produtoResponseSchema,
  ProdutoResponseDto,
  getAllProdutosResponseSchema,
  GetAllProdutosResponseDto,
  uploadResumoResponseSchema,
  UploadResumoResponseDto,
} from "../schemas/insumos/insumos.response";

export const uploadInsumos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const file = (req as any).file as Express.Multer.File;
  if (!file?.originalname) {
    return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
  }

  const name = file.originalname.toLowerCase();
  const isXlsx = name.endsWith(".xlsx") || name.endsWith(".xls");
  const isCsv = name.endsWith(".csv");

  if (!isXlsx && !isCsv) {
    return res.status(400).json({
      error: "Formato de arquivo não suportado. Use .xlsx, .xls ou .csv.",
    });
  }

  const fileType: "CSV" | "Excel" = isCsv ? "CSV" : "Excel";

  try {
    //Ler arquivos -> rows
    let rows: Record<string, any>[] = [];
    if (isXlsx) {
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      if (!workbook.SheetNames.length) {
        return res.status(400).json({
          error: "O arquivo Excel não contém planilhas.",
        });
      }
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName!];
      if (!worksheet) {
        return res.status(400).json({
          error: `A planilha "${firstSheetName}" não foi encontrada. O arquivo pode estar corrompido.`,
        });
      }
      rows = XLSX.utils.sheet_to_json(worksheet!, { defval: "" }) as Record<
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
          trim: true,
          bom: true,
        }) as Record<string, any>[];
      } catch (err) {
        //fallback simples
        const attempts: Array<{
          encoding: BufferEncoding | "latin1";
          delimiter: string;
        }> = [
          { encoding: "utf-8", delimiter: "," },
          { encoding: "utf-8", delimiter: ";" },
          { encoding: "latin1", delimiter: "," },
          { encoding: "latin1", delimiter: ";" },
        ];
        let ok = false;
        for (const attempt of attempts) {
          try {
            const d = file.buffer.toString(
              attempt.encoding === "latin1" ? "latin1" : attempt.encoding
            );
            rows = csvParse(d, {
              columns: true,
              delimiter: attempt.delimiter,
              skip_empty_lines: true,
              trim: true,
              bom: true,
            }) as Record<string, any>[];
            ok = rows.length > 0;
            if (ok) break;
          } catch {
            //tentar próximo
          }
        }

        if (!ok) {
          return res.status(400).json({
            error:
              "Não foi possível analisar o arquivo CSV. Verifique o formato e o conteúdo do arquivo.",
          });
        }
      }
    }

    if (!rows.length) {
      return res.status(400).json({ error: "O arquivo enviado está vazio." });
    }

    //Mapear colunas
    let mappedRows = rows.map((r) => renomearColunas(r, columnMapping));

    //Insumo_ItemObsoleto normalização
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

    const columns = new Set(Object.keys(mappedRows ?? {}));

    const hasInsumoCodigo = columns.has("Insumo_Cod");
    const hasSeparateCodes =
      columns.has("Insumo_Cod") && columns.has("SubInsumo_Cod");
    const hasInsumoEspecificacao = columns.has("Insumo_Especificacao");
    const hasSubInsumoEspecificacao = columns.has("SubInsumo_Especificacao");

    if (!hasInsumoCodigo && !hasSeparateCodes) {
      return res.status(400).json({
        error:
          "O arquivo deve conter a coluna 'Insumo_Cod' ou ambas 'Insumo_Cod' e 'SubInsumo_Cod'.",
        colunasEncontradas: Array.from(columns),
      });
    }

    for (const required of ["Unid_Cod", "INSUMO_ITEMOBSOLETO"]) {
      if (!columns.has(required)) {
        return res.status(400).json({
          error: `O arquivo deve conter a coluna obrigatória '${required}'.`,
          colunasEncontradas: Array.from(columns),
        });
      }
    }

    //Insumo_Codigo -> Insumo_Cod + SubInsumo_Cod
    if (hasInsumoCodigo) {
      mappedRows = mappedRows.map((r) => {
        const { insumo, sub } = separarCodigo(String(r.Insumo_Codigo || ""));
        r.Insumo_Cod = insumo;
        r.SubInsumo_Cod = sub;
        delete r.Insumo_Codigo;
        return r;
      });
    }

    //Insumo_Especificacao -> SubInsumo_Especificacao
    if (hasInsumoEspecificacao) {
      mappedRows = mappedRows.map((r) => {
        r.SubInsumo_Especificacao = r.Insumo_Especificacao;
        delete r.Insumo_Especificacao;
        return r;
      });
    }

    //Limpeza + Normalização
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
            : "",
        SubInsumo_Especificacao:
          r.SubInsumo_Especificacao != null
            ? String(r.SubInsumo_Especificacao).trim()
            : null,
        INSUMO_ITEMOBSOLETO: normalizarObsoleto(r.INSUMO_ITEMOBSOLETO),
      }))
      .filter((r) => r.Insumo_Cod != null && r.SubInsumo_Especificacao != null)
      .map((r) => ({
        Insumo_Cod: r.Insumo_Cod!,
        SubInsumo_Cod: r.SubInsumo_Cod,
        Unid_Cod: r.Unid_Cod,
        SubInsumo_Especificacao: r.SubInsumo_Especificacao!,
        INSUMO_ITEMOBSOLETO: r.INSUMO_ITEMOBSOLETO,
      })) as Array<{
      Insumo_Cod: string;
      SubInsumo_Cod: string | null;
      Unid_Cod: string;
      SubInsumo_Especificacao: string;
      INSUMO_ITEMOBSOLETO: string;
    }>;

    //Dedupe no payload(Remove duplicadas mantendo a primeira ocorrência)
    const uniqueMap = new Map<string, (typeof cleaned)[number]>();
    for (const r of cleaned) {
      const key = `${r.Insumo_Cod}::${r.SubInsumo_Cod ?? "NULL"}::${r.SubInsumo_Especificacao} `;
      if (!uniqueMap.has(key)) uniqueMap.set(key, r);
    }

    const uniqueRows = Array.from(uniqueMap.values());

    //Checar existentes em lotes
    const batchSize = 500;
    const existingKeys = new Set<string>();

    for (let i = 0; i < uniqueRows.length; i += batchSize) {
      const batch = uniqueRows.slice(i, i + batchSize);

      const orConditions = batch.map((b) => ({
        Insumo_Cod: b.Insumo_Cod,
        SubInsumo_Cod: b.SubInsumo_Cod,
        SubInsumo_Especificacao: b.SubInsumo_Especificacao,
      }));

      const existing = await Insumos.findAll({
        attributes: ["Insumo_Cod", "SubInsumo_Cod", "SubInsumo_Especificacao"],
        where: { [Op.or]: orConditions },
        raw: true,
      });

      for (const e of existing as any[]) {
        const key = `${String(e.Insumo_Cod)}::${e.SubInsumo_Cod ?? "NULL"}::${String(e.SubInsumo_Especificacao)} `;
        existingKeys.add(key);
      }
    }

    const newRecords = uniqueRows.filter((r) => {
      const key = `${r.Insumo_Cod}::${r.SubInsumo_Cod ?? "NULL"}::${r.SubInsumo_Especificacao} `;
      return !existingKeys.has(key);
    });

    if (!newRecords.length) {
      const dto: UploadResumoResponseDto = uploadResumoResponseSchema.parse({
        message:
          "Nenhum novo insumo para adicionar. Todos os registros já existem na base de dados.",
        total_rows: uniqueRows.length,
        new_rows: 0,
        ignored_rows: uniqueRows.length,
        file_type: fileType,
      });
      return res.status(200).json(dto);
    }

    //Inserir em lotes
    for (let i = 0; i < newRecords.length; i += batchSize) {
      const batch = newRecords.slice(i, i + batchSize);
      await Insumos.bulkCreate(batch, { ignoreDuplicates: true });
    }

    //SQL de limpeza de duplicados (postgres)
    try {
      await Insumos.sequelize?.query(`
      DELETE FROM "Insumos"
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM "Insumos"
        GROUP BY "Insumo_Cod", "SubInsumo_Cod", "SubInsumo_Especificacao"
      );
    `);
    } catch (err) {
      console.error("Erro ao remover duplicados após upload de insumos:", err);
    }

    const total_rows = uniqueRows.length;
    const new_rows = newRecords.length;
    const ignored_rows = total_rows - new_rows;

    const processamento: string[] = [];
    if (hasInsumoCodigo) {
      processamento.push(
        "Separação do código do insumo em 'Insumo_Cod' e 'SubInsumo_Cod'."
      );
    }
    if (hasInsumoEspecificacao) {
      processamento.push(
        "Renomeação da coluna 'Insumo_Especificacao' para 'SubInsumo_Especificacao'."
      );
    }

    const dto: UploadResumoResponseDto = uploadResumoResponseSchema.parse({
      message: `Processamento concluído. ${new_rows} novos insumos adicionados, ${ignored_rows} registros ignorados(já existiam). Limpeza de duplicados executada.`,
      total_rows,
      new_rows,
      ignored_rows,
      file_type: fileType,
      processamento: processamento.join(", "),
    });

    res.status(200).json(dto);
  } catch (error) {
    console.error("Erro ao processar o upload de insumos:", error);
    res
      .status(500)
      .json({ error: "Ocorreu um erro ao processar o arquivo enviado." });
  }
};

export const createInsumo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dto = produtoBaseSchema.parse(req.body);
    const novoInsumo = await Insumos.create(dto);
    const responseDto: ProdutoResponseDto = produtoResponseSchema.parse(
      novoInsumo.toJSON()
    );
    res.status(201).json(responseDto);
  } catch (error) {
    console.error("Erro ao criar novo insumo:", error);
    res.status(500).json({ error: "Ocorreu um erro ao criar o insumo." });
  }
};

export const getAllInsumos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const insumos = await Insumos.findAll();
    const responseDto: GetAllProdutosResponseDto =
      getAllProdutosResponseSchema.parse(
        insumos.map((insumo) => insumo.toJSON())
      );
    res.status(200).json(responseDto);
  } catch (error) {
    console.error("Erro ao buscar todos os insumos:", error);
    res.status(500).json({ error: "Ocorreu um erro ao buscar os insumos." });
  }
};
