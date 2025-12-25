"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const CentroCusto = dbConfig_1.default.define("CentroCusto", {
    id: {
        type: sequelize_1.default.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nome: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
}, {
    tableName: "centro_custo",
    timestamps: false,
});
exports.default = CentroCusto;
//# sourceMappingURL=centroCustoModel.js.map