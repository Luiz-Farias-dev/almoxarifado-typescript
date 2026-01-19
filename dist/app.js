"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dbConfig_1 = __importDefault(require("./config/dbConfig"));
const centroCusto_model_1 = __importDefault(require("./models/centroCusto.model"));
const obra_model_1 = __importDefault(require("./models/obra.model"));
const user_model_1 = __importDefault(require("./models/user.model"));
require("./models/listaEspera.model");
require("./models/insumos.model");
require("./models/tabelaFinal.model");
const centroCusto_1 = __importDefault(require("./routes/centroCusto"));
const obra_1 = __importDefault(require("./routes/obra"));
const insumos_1 = __importDefault(require("./routes/insumos"));
const UserCentroCusto = dbConfig_1.default.define("user_centro_custo", {}, { tableName: "user_centro_custo", timestamps: false });
obra_model_1.default.hasMany(user_model_1.default, { foreignKey: "obraId" });
user_model_1.default.belongsTo(obra_model_1.default, { foreignKey: "obraId" });
obra_model_1.default.hasMany(centroCusto_model_1.default, { foreignKey: "obraId" });
centroCusto_model_1.default.belongsTo(obra_model_1.default, { foreignKey: "obraId" });
user_model_1.default.belongsToMany(centroCusto_model_1.default, {
    through: UserCentroCusto,
    foreignKey: "userId",
    otherKey: "centroCustoId",
});
centroCusto_model_1.default.belongsToMany(user_model_1.default, {
    through: UserCentroCusto,
    foreignKey: "centroCustoId",
    otherKey: "userId",
});
const app = (0, express_1.default)();
const port = 8080;
app.use(express_1.default.json());
app.use(centroCusto_1.default);
app.use(obra_1.default);
app.use(insumos_1.default);
const bootstrap = async () => {
    try {
        await dbConfig_1.default.authenticate();
        await dbConfig_1.default.sync({ force: true });
        // await sequelize.sync();
        app.listen(port, () => {
            console.log(`Servidor está rodando na porta http://localhost:${port}`);
            console.log("Servidor está pronto para receber requisições!");
        });
    }
    catch (err) {
        console.error("Não foi possível conectar ao banco de dados:", err);
        process.exit(1);
    }
};
bootstrap();
//# sourceMappingURL=app.js.map