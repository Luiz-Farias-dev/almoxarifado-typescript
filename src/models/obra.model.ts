import Sequelize from "sequelize";
import sequelize from "../config/dbConfig";

const Obra = sequelize.define(
  "Obras",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    initials: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Obras",
    timestamps: false,
  }
);

export default Obra;
