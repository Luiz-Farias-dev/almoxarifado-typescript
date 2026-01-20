import express from "express";
import Sequelize from "sequelize";

import sequelize from "./config/dbConfig";

import CentroCusto from "./models/centroCusto.model";
import Obra from "./models/obra.model";
import User from "./models/user.model";
import "./models/listaEspera.model";
import "./models/insumos.model";
import "./models/tabelaFinal.model";
import UserCentroCusto from "./models/userCentroCusto.model";

import centroCustoRoutes from "./routes/centroCusto";
import obrasRoutes from "./routes/obra";
import insumos from "./routes/insumos";
import listaEsperaRoutes from "./routes/listaEspera";

// UserCentroCusto model is now imported from models/userCentroCusto.model.ts

Obra.hasMany(User, { foreignKey: "obra_id" });
User.belongsTo(Obra, { foreignKey: "obra_id" });

Obra.hasMany(CentroCusto, { foreignKey: "work_id" });
CentroCusto.belongsTo(Obra, { foreignKey: "work_id" });

User.belongsToMany(CentroCusto, {
  through: UserCentroCusto,
  foreignKey: "funcionario_id",
  otherKey: "centro_custo_cod",
});

CentroCusto.belongsToMany(User, {
  through: UserCentroCusto,
  foreignKey: "centro_custo_cod",
  otherKey: "funcionario_id",
});

const app = express();
const port = 8080;

app.use(express.json());

app.use(centroCustoRoutes);
app.use(obrasRoutes);
app.use(insumos);
app.use(listaEsperaRoutes);

const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    // await sequelize.sync();

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
