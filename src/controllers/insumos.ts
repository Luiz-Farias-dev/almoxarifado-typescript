import { Request, Response, NextFunction } from "express";
import * as XLSX from "xlsx";
import { parse as csvParse } from "csv-parse/sync";
import chardet from "jschardet";
import iconv from "iconv-lite";
import { Op } from "sequelize";

import Insumos from "../models/Insumo";
//import { produtoBaseBodySchema, ProdutoBaseBodyDto } from "../schemas/produtoCatalogo/produtoCatalogo.schema";
// import {
//   produtoResponseSchema,
//   ProdutoResponseDto,
//   getAllProdutosResponseSchema,
//   GetAllProdutosResponseDto,
//   uploadResumoResponseSchema,
//   UploadResumoResponseDto,
// } from "../schemas/produtoCatalogo/produtoCatalogo.response";

// ====== Helpers ======
