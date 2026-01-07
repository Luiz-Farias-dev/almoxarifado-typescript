import chardet from "jschardet";
import iconv from "iconv-lite";

//A função extrai os 3 últimos caracteres como "sub" e o restante como "insumo", com tratamentos especiais para valores vazios ou muito curtos.
export const separarCodigo = (
  insumoCodigo: any
): { insumo: string | null; sub: string | null } => {
  if (insumoCodigo === null || insumoCodigo === undefined)
    return { insumo: null, sub: null };

  const codigoStr = String(insumoCodigo).trim();
  if (!codigoStr) return { insumo: null, sub: null };

  if (codigoStr.length <= 3) return { insumo: codigoStr, sub: null };

  return { insumo: codigoStr.slice(0, -3), sub: codigoStr.slice(-3) };
};

// A função detecta a codificação e o delimitador de um buffer de arquivo CSV.
export const detectarEncodingEDelimitador = (
  buf: Buffer
): { encoding: string; delimiter: string } => {
  const det = chardet.detect(buf);
  const encoding = (det.encoding || "utf-8").toLowerCase();

  let sample = "";
  try {
    sample = iconv.decode(buf.subarray(0, 10000), encoding);
  } catch {
    sample = buf.subarray(0, 10000).toString("utf-8");
  }
  const delimiters = [",", ";", "\t", "|"];
  const counts = delimiters.map((delim) => ({
    delim,
    count: (sample.match(new RegExp(`\\${delim}`, "g")) || []).length,
  }));
  counts.sort((a, b) => b.count - a.count);
  return { encoding, delimiter: counts[0]?.delim ?? "," };
};

// A função normaliza valores booleanos para "S" ou "N".
export const normalizarObsoleto = (value: any): string => {
  const v = String(value ?? "")
    .trim()
    .toUpperCase();
  if (
    ["SIM", "S", "YES", "Y", "TRUE", "1", "OBSOLETO", "OBSSOLETO"].includes(v)
  )
    return "S";
  if (["NAO", "NÃO", "N", "NO", "FALSE", "0", ""].includes(v)) return "N";
  return v || "N";
};

export const renomearColunas = (
  row: Record<string, any>,
  mapping: Record<string, string>
): Record<string, any> => {
  const out: Record<string, any> = { ...row };
  for (const [oldKey, newKey] of Object.entries(mapping)) {
    if (Object.prototype.hasOwnProperty.call(out, oldKey)) {
      out[newKey] = out[oldKey];
      if (newKey !== oldKey) delete out[oldKey];
    }
  }
  return out;
};

export const columnMapping: Record<string, string> = {
  // formato antigo
  Insumo_Cod: "Insumo_Cod",
  SubInsumo_Cod: "SubInsumo_Cod",
  Unid_Cod: "Unid_Cod",
  SubInsumo_Especificacao: "SubInsumo_Especificacao",
  INSUMO_ITEMOBSOLETO: "INSUMO_ITEMOBSOLETO",
  Insumo_ItemObsoleto: "Insumo_ItemObsoleto",

  // novas colunas unificadas
  Insumo_Codigo: "Insumo_Codigo",
  Insumo_Especificacao: "Insumo_Especificacao",

  // alternativos
  "Código Insumo": "Insumo_Codigo",
  "Código do Insumo": "Insumo_Codigo",
  "Codigo Insumo": "Insumo_Codigo",
  Código: "Insumo_Codigo",
  "Código Produto": "Insumo_Codigo",
  "Código Material": "Insumo_Codigo",

  "Especificação Insumo": "Insumo_Especificacao",
  "Especificação do Insumo": "Insumo_Especificacao",
  "Especificacao Insumo": "Insumo_Especificacao",

  "Código SubInsumo": "SubInsumo_Cod",
  "Código do SubInsumo": "SubInsumo_Cod",
  "Codigo SubInsumo": "SubInsumo_Cod",

  Unidade: "Unid_Cod",
  "Unidade de Medida": "Unid_Cod",

  Especificação: "SubInsumo_Especificacao",
  Descrição: "SubInsumo_Especificacao",
  Especificacao: "SubInsumo_Especificacao",

  Obsoleto: "Insumo_ItemObsoleto",
  "Item Obsoleto": "Insumo_ItemObsoleto",
  "Status Obsoleto": "Insumo_ItemObsoleto",
};
