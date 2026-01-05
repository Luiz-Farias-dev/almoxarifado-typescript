import Sequelize from "sequelize";

import sequelize from "../config/dbConfig";

const Obra = sequelize.define("obra", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

export default Obra;
