import Sequelize from "sequelize";
import sequelize from "../config/dbConfig";

const UserCentroCusto = sequelize.define(
  "user_centro_custo",
  {
    funcionario_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "informacoes_pessoais",
        key: "id",
      },
    },
    centro_custo_cod: {
      type: Sequelize.CHAR(50),
      primaryKey: true,
      allowNull: false,
      references: {
        model: "Centro_de_Custo",
        key: "Centro_Negocio_Cod",
      },
    },
    obra_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "funcionario_centro_custo",
    timestamps: false,
  }
);

export default UserCentroCusto;
