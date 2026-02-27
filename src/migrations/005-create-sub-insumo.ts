import { DataTypes } from 'sequelize';
import type { MigrationFn } from '../config/umzug';

export const up: MigrationFn = async ({ context: queryInterface }) => {
  await queryInterface.createTable('SubInsumo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Insumo_Cod: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SubInsumo_Cod: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Unid_Cod: {
      type: DataTypes.CHAR(10),
      allowNull: false,
    },
    SubInsumo_Especificacao: {
      type: DataTypes.CHAR(255),
      allowNull: false,
    },
    INSUMO_ITEMOBSOLETO: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    Audit_Insert_Date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    Audit_LastChange: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });
};

export const down: MigrationFn = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('SubInsumo');
};
