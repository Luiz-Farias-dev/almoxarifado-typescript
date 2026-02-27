import { DataTypes } from 'sequelize';
import type { MigrationFn } from '../config/umzug';

export const up: MigrationFn = async ({ context: queryInterface }) => {
  await queryInterface.createTable('Centro_de_Custo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Centro_Negocio_Cod: {
      type: DataTypes.CHAR(50),
      unique: true,
      allowNull: false,
    },
    Centro_Nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    work_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Obras',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
  });
};

export const down: MigrationFn = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('Centro_de_Custo');
};
