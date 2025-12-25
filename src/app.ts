import express from "express";

import sequelize from "./config/dbConfig";

const app = express();
const port = 8080;

app.use(express.json());

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
