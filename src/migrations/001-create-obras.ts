import { DataTypes } from 'sequelize';
import type { MigrationFn } from '../config/umzug';

export const up: MigrationFn = async ({ context: queryInterface }) => {
  await queryInterface.createTable('Obras', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    initials: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};

export const down: MigrationFn = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('Obras');
};
