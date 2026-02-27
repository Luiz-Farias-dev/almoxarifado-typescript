import { DataTypes } from 'sequelize';
import type { MigrationFn } from '../config/umzug';

export const up: MigrationFn = async ({ context: queryInterface }) => {
  await queryInterface.createTable('funcionario_centro_custo', {
    funcionario_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'informacoes_pessoais',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    centro_custo_cod: {
      type: DataTypes.CHAR(50),
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'Centro_de_Custo',
        key: 'Centro_Negocio_Cod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    obra_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });
};

export const down: MigrationFn = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('funcionario_centro_custo');
};
