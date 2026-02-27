import { DataTypes } from 'sequelize';
import type { MigrationFn } from '../config/umzug';

export const up: MigrationFn = async ({ context: queryInterface }) => {
  await queryInterface.createTable('informacoes_pessoais', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo_funcionario: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    empresa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    senha_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    primeiroLogin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    obra_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Obras',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  });
};

export const down: MigrationFn = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('informacoes_pessoais');
};
