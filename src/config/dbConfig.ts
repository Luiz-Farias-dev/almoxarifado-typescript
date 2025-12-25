import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "almoxarifado-cortez-node",
  "postgres",
  "123456",
  {
    host: "localhost",
    dialect: "postgres",
    logging: false,
  }
);

export default sequelize;
