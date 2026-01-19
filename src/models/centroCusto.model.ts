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
    centroNegocioCod: {
      type: Sequelize.STRING,
      allowNull: true,
      field: "Centro_Negocio_Cod",
    },
    obraId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "obra",
        key: "id",
      },
    },
  },
  {
    tableName: "centro_custo",
    timestamps: false,
  }
);

export default CentroCusto;
