import Sequelize from "sequelize";
import sequelize from "../config/dbConfig";

const UserCentroCusto = sequelize.define(
  "user_centro_custo",
  {
    userId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      field: "userId",
    },
    centroCustoId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      field: "centroCustoId",
    },
    obraId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: "obraId",
    },
  },
  {
    tableName: "user_centro_custo",
    timestamps: false,
    // Sequelize will use the field names as specified above
  }
);

export default UserCentroCusto;
