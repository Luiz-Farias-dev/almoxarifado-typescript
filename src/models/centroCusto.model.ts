import Sequelize from "sequelize";
import sequelize from "../config/dbConfig";

const CentroCusto = sequelize.define(
  "Centro_de_Custo",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Centro_Negocio_Cod: {
      type: Sequelize.CHAR(50),
      primaryKey: true,
      allowNull: false,
    },
    Centro_Nome: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    work_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Obras",
        key: "id",
      },
    },
  },
  {
    tableName: "Centro_de_Custo",
    timestamps: false,
  }
);

export default CentroCusto;
