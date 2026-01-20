import Sequelize from "sequelize";
import sequelize from "../config/dbConfig";

const User = sequelize.define(
  "informacoes_pessoais",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    cpf: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tipo_funcionario: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    empresa: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    senha_hash: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    primeiroLogin: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    obra_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Obras",
        key: "id",
      },
    },
  },
  {
    tableName: "informacoes_pessoais",
    timestamps: false,
  }
);

export default User;
