"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dbConfig_1 = __importDefault(require("./config/dbConfig"));
const centroCusto_model_1 = __importDefault(require("./models/centroCusto.model"));
const obra_model_1 = __importDefault(require("./models/obra.model"));
const user_model_1 = __importDefault(require("./models/user.model"));
require("./models/listaEspera.model");
require("./models/insumos.model");
require("./models/tabelaFinal.model");
const userCentroCusto_model_1 = __importDefault(require("./models/userCentroCusto.model"));
const auth_1 = __importDefault(require("./routes/auth"));
const centroCusto_1 = __importDefault(require("./routes/centroCusto"));
const obra_1 = __importDefault(require("./routes/obra"));
const insumos_1 = __importDefault(require("./routes/insumos"));
const listaEspera_1 = __importDefault(require("./routes/listaEspera"));
const tabelaFinal_1 = __importDefault(require("./routes/tabelaFinal"));
// UserCentroCusto model is now imported from models/userCentroCusto.model.ts
obra_model_1.default.hasMany(user_model_1.default, { foreignKey: "obra_id" });
user_model_1.default.belongsTo(obra_model_1.default, { foreignKey: "obra_id" });
obra_model_1.default.hasMany(centroCusto_model_1.default, { foreignKey: "work_id" });
centroCusto_model_1.default.belongsTo(obra_model_1.default, { foreignKey: "work_id" });
user_model_1.default.belongsToMany(centroCusto_model_1.default, {
    through: userCentroCusto_model_1.default,
    foreignKey: "funcionario_id",
    otherKey: "centro_custo_cod",
});
centroCusto_model_1.default.belongsToMany(user_model_1.default, {
    through: userCentroCusto_model_1.default,
    foreignKey: "centro_custo_cod",
    otherKey: "funcionario_id",
});
const app = (0, express_1.default)();
const port = 8080;
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(auth_1.default);
app.use(centroCusto_1.default);
app.use(obra_1.default);
app.use(insumos_1.default);
app.use(listaEspera_1.default);
app.use(tabelaFinal_1.default);
const bootstrap = async () => {
    try {
        await dbConfig_1.default.authenticate();
        // await sequelize.sync({ force: true });
        await dbConfig_1.default.sync();
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