"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const ListaEspera = dbConfig_1.default.define("lista_espera", {
    id: {
        type: sequelize_1.default.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    codigo_pedido: {
        type: sequelize_1.default.INTEGER,
        allowNull: false,
    },
    Insumo_Cod: {
        type: sequelize_1.default.INTEGER,
        allowNull: false,
    },
    SubInsumo_Cod: {
        type: sequelize_1.default.INTEGER,
        allowNull: false,
    },
    SubInsumo_Especificacao: {
        type: sequelize_1.default.STRING(255),
        allowNull: false,
    },
    quantidade: {
        type: sequelize_1.default.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    almoxarifeNome: {
        type: sequelize_1.default.STRING(100),
        allowNull: false,
    },
    centroCusto: {
        type: sequelize_1.default.JSONB,
        allowNull: false,
    },
    Unid_Cod: {
        type: sequelize_1.default.CHAR(5),
        allowNull: false,
    },
    destino: {
        type: sequelize_1.default.STRING(255),
        allowNull: false,
    },
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
exports.default = ListaEspera;
//# sourceMappingURL=listaEspera.model.js.map