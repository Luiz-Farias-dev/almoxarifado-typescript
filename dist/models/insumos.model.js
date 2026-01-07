"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const Insumos = dbConfig_1.default.define("insumos", {
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
        type: sequelize_1.default.CHAR(5),
        allowNull: false,
    },
    SubInsumo_Especificacao: {
        type: sequelize_1.default.STRING(255),
        allowNull: false,
    },
    Insumo_ItemObsoleto: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
exports.default = Insumos;
//# sourceMappingURL=insumos.model.js.map