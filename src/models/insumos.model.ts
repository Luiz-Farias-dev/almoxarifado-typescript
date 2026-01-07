import Sequelize from "sequelize";
import sequelize from "../config/dbConfig";

const Insumos = sequelize.define(
  "insumos",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Insumo_Cod: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    SubInsumo_Cod: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    Unid_Cod: {
      type: Sequelize.CHAR(5),
      allowNull: false,
    },
    SubInsumo_Especificacao: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    Insumo_ItemObsoleto: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Insumos;
