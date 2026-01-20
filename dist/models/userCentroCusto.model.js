"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const UserCentroCusto = dbConfig_1.default.define("user_centro_custo", {
    funcionario_id: {
        type: sequelize_1.default.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: "informacoes_pessoais",
            key: "id",
        },
    },
    centro_custo_cod: {
        type: sequelize_1.default.CHAR(50),
        primaryKey: true,
        allowNull: false,
        references: {
            model: "Centro_de_Custo",
            key: "Centro_Negocio_Cod",
        },
    },
    obra_id: {
        type: sequelize_1.default.INTEGER,
        allowNull: true,
    },
}, {
    tableName: "funcionario_centro_custo",
    timestamps: false,
});
exports.default = UserCentroCusto;
//# sourceMappingURL=userCentroCusto.model.js.map