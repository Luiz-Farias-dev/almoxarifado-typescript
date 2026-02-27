import { Umzug, SequelizeStorage } from 'umzug';
import { QueryInterface } from 'sequelize';
import sequelize from './dbConfig';

export const umzug = new Umzug({
  migrations: { glob: 'src/migrations/*.ts' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export type MigrationFn = (params: { context: QueryInterface }) => Promise<void>;
