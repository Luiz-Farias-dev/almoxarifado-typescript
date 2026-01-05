"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const Obra = dbConfig_1.default.define("obra", {
    id: {
        type: sequelize_1.default.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
});
exports.default = Obra;
//# sourceMappingURL=obra.model.js.map