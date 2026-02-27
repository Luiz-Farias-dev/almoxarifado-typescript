import { DataTypes } from 'sequelize';
import type { MigrationFn } from '../config/umzug';

export const up: MigrationFn = async ({ context: queryInterface }) => {
  await queryInterface.createTable('tabela_final', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Centro_Negocio_Cod: {
      type: DataTypes.CHAR(50),
      allowNull: false,
    },
    Insumo_e_SubInsumo_Cod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Observacao: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    Num_Doc: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Tipo_Doc: {
      type: DataTypes.CHAR(2),
      allowNull: false,
    },
    Tipo_Movimentacao: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'S',
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    destino: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    data_att: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
};

export const down: MigrationFn = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('tabela_final');
};
