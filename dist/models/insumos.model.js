"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const Insumos = dbConfig_1.default.define("SubInsumo", {
    id: {
        type: sequelize_1.default.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    Insumo_Cod: {
        type: sequelize_1.default.INTEGER,
        allowNull: false,
    },
    SubInsumo_Cod: {
        type: sequelize_1.default.INTEGER,
        allowNull: false,
    },
    Unid_Cod: {
        type: sequelize_1.default.CHAR(10),
        allowNull: false,
    },
    SubInsumo_Especificacao: {
        type: sequelize_1.default.CHAR(255),
        allowNull: false,
    },
    INSUMO_ITEMOBSOLETO: {
        type: sequelize_1.default.CHAR(1),
        allowNull: true,
    },
    Audit_Insert_Date: {
        type: sequelize_1.default.DATE,
        allowNull: true,
    },
    Audit_LastChange: {
        type: sequelize_1.default.DATE,
        allowNull: true,
    },
}, {
    tableName: "SubInsumo",
    timestamps: false,
});
exports.default = Insumos;
//# sourceMappingURL=insumos.model.js.map