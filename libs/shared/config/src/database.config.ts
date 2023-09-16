import { ConfigKey, readenv } from '@face-recognition-demo/shared/utils';
import { BaseConfig } from './base.config';

export class DatabaseConfig extends BaseConfig {
  constructor(
    keys: ConfigKey = {
      connectionString: {
        envKey: 'DATABASE_CONN_STRING',
      },
      dbName: {
        envKey: 'DATABASE_DB_NAME',
        default: 'neondb',
      },
    }
  ) {
    super(keys);
  }

  get connectionString() {
    return readenv(this.keys['connectionString']);
  }

  get dbName() {
    return readenv(this.keys['dbName']);
  }
}
