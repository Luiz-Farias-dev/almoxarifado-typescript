import Sequelize from "sequelize";
import sequelize from "../config/dbConfig";
import Insumos from "./insumos.model";

const ListaEspera = sequelize.define(
  "lista_espera",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    codigo_pedido: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    Insumo_Cod: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    SubInsumo_Cod: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    SubInsumo_Especificacao: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    quantidade: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    almoxarifeNome: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    centroCusto: {
      type: Sequelize.JSONB,
      allowNull: false,
    },
    Unid_Cod: {
      type: Sequelize.CHAR(5),
      allowNull: false,
    },
    destino: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ListaEspera;
