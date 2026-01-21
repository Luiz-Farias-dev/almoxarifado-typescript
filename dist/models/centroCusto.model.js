"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const CentroCusto = dbConfig_1.default.define("Centro_de_Custo", {
    id: {
        type: sequelize_1.default.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    Centro_Negocio_Cod: {
        type: sequelize_1.default.CHAR(50),
        primaryKey: true,
        allowNull: false,
    },
    Centro_Nome: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    work_id: {
        type: sequelize_1.default.INTEGER,
        allowNull: false,
        references: {
            model: "Obras",
            key: "id",
        },
    },
}, {
    tableName: "Centro_de_Custo",
    timestamps: false,
});
exports.default = CentroCusto;
//# sourceMappingURL=centroCusto.model.js.map