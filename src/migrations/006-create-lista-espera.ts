import { DataTypes } from 'sequelize';
import type { MigrationFn } from '../config/umzug';

export const up: MigrationFn = async ({ context: queryInterface }) => {
  await queryInterface.createTable('lista_espera', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    codigo_pedido: {
      type: DataTypes.INTEGER,
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
    SubInsumo_Especificacao: {
      type: DataTypes.CHAR(255),
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1,
    },
    almoxarife_nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    centro_custo: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    Unid_Cod: {
      type: DataTypes.CHAR(10),
      allowNull: false,
    },
    destino: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    data_att: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
};

export const down: MigrationFn = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('lista_espera');
};
