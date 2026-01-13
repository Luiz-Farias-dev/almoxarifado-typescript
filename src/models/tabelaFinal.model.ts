import Sequelize from "sequelize";
import sequelize from "../config/dbConfig";

const TabelaFinal = sequelize.define(
  "tabela_final",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Centro_Negocio_Cod: {
      type: Sequelize.CHAR(50),
      allowNull: false,
    },
    Insumo_e_SubInsumo_Cod: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    Observacao: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },
    Num_Doc: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    Tipo_Doc: {
      type: Sequelize.CHAR(2),
      allowNull: false,
    },
    Tipo_Movimentacao: {
      type: Sequelize.CHAR(1),
      allowNull: false,
      defaultValue: "S",
    },
    quantidade: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    destino: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default TabelaFinal;
