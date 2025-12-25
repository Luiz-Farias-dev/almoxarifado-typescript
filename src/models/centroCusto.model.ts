import Sequelize from "sequelize";

import sequelize from "../config/dbConfig";

const CentroCusto = sequelize.define(
  "CentroCusto",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "centro_custo",
    timestamps: false,
  }
);

export default CentroCusto;
