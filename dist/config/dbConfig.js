"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize("almoxarifado-cortez-node", "postgres", "123456", {
    host: "localhost",
    dialect: "postgres",
    logging: false,
});
exports.default = sequelize;
//# sourceMappingURL=dbConfig.js.map