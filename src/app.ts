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

Obra.hasMany(User, { foreignKey: "obraId" });
User.belongsTo(Obra, { foreignKey: "obraId" });

Obra.hasMany(CentroCusto, { foreignKey: "obraId" });
CentroCusto.belongsTo(Obra, { foreignKey: "obraId" });

User.belongsToMany(CentroCusto, {
  through: UserCentroCusto,
  foreignKey: "userId",
  otherKey: "centroCustoId",
});

CentroCusto.belongsToMany(User, {
  through: UserCentroCusto,
  foreignKey: "centroCustoId",
  otherKey: "userId",
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
