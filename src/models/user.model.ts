import Sequelize from "sequelize";
import sequelize from "../config/dbConfig";

const User = sequelize.define("user", {
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
  tipoFuncionario: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  empresa: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  senha: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  primeiroLogin: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  obraId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: "obra",
      key: "id",
    },
  },
});

export default User;
