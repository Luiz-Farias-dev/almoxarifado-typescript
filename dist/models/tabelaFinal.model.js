"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const TabelaFinal = dbConfig_1.default.define("tabela_final", {
    id: {
        type: sequelize_1.default.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    Centro_Negocio_Cod: {
        type: sequelize_1.default.CHAR(50),
        allowNull: false,
    },
    Insumo_e_SubInsumo_Cod: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    Observacao: {
        type: sequelize_1.default.STRING(500),
        allowNull: true,
    },
    Num_Doc: {
        type: sequelize_1.default.INTEGER,
        allowNull: false,
    },
    Tipo_Doc: {
        type: sequelize_1.default.CHAR(2),
        allowNull: false,
    },
    Tipo_Movimentacao: {
        type: sequelize_1.default.CHAR(1),
        allowNull: false,
        defaultValue: "S",
    },
    quantidade: {
        type: sequelize_1.default.INTEGER,
        allowNull: false,
    },
    destino: {
        type: sequelize_1.default.STRING(255),
        allowNull: true,
    },
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
exports.default = TabelaFinal;
//# sourceMappingURL=tabelaFinal.model.js.map