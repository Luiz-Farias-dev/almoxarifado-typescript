"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dbConfig_1 = __importDefault(require("./config/dbConfig"));
require("./models/centroCusto.model");
const centroCusto_1 = __importDefault(require("./routes/centroCusto"));
const obra_1 = __importDefault(require("./routes/obra"));
const app = (0, express_1.default)();
const port = 8080;
app.use(express_1.default.json());
app.use(centroCusto_1.default);
app.use(obra_1.default);
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