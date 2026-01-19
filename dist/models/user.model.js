"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const User = dbConfig_1.default.define("user", {
    id: {
        type: sequelize_1.default.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    cpf: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    tipoFuncionario: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    empresa: {
        type: sequelize_1.default.STRING,
        allowNull: true,
    },
    senha: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    primeiroLogin: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
});
exports.default = User;
//# sourceMappingURL=user.model.js.map