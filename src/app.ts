import express from "express";

import sequelize from "./config/dbConfig";

import "./models/centroCusto.model";
import "./models/obra.model";
import "./models/user.model";
import "./models/listaEspera.model";
import "./models/insumo.model";
import "./models/tabelaFinal.model";

import centroCustoRoutes from "./routes/centroCusto";
import obrasRoutes from "./routes/obra";
import insumos from "./routes/insumos";

const app = express();
const port = 8080;

app.use(express.json());

app.use(centroCustoRoutes);
app.use(obrasRoutes);
app.use(insumos);

const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync({ force: true });
    await sequelize.sync();

    app.listen(port, () => {
      console.log(`Servidor está rodando na porta http://localhost:${port}`);
      console.log("Servidor está pronto para receber requisições!");
    });
  } catch (err) {
    console.error("Não foi possível conectar ao banco de dados:", err);
    process.exit(1);
  }
};

bootstrap();
