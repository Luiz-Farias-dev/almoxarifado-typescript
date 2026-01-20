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
      type: Sequelize.CHAR(255),
      allowNull: false,
    },
    quantidade: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 1,
    },
    almoxarife_nome: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    centro_custo: {
      type: Sequelize.JSONB,
      allowNull: false,
    },
    Unid_Cod: {
      type: Sequelize.CHAR(10),
      allowNull: false,
    },
    destino: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    data_att: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "lista_espera",
    timestamps: false,
  }
);

export default ListaEspera;
