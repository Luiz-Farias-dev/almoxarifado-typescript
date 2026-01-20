import Sequelize from "sequelize";
import sequelize from "../config/dbConfig";

const Insumos = sequelize.define(
  "SubInsumo",
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
      type: Sequelize.CHAR(10),
      allowNull: false,
    },
    SubInsumo_Especificacao: {
      type: Sequelize.CHAR(255),
      allowNull: false,
    },
    INSUMO_ITEMOBSOLETO: {
      type: Sequelize.CHAR(1),
      allowNull: true,
    },
    Audit_Insert_Date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    Audit_LastChange: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "SubInsumo",
    timestamps: false,
  }
);

export default Insumos;
