import { Face } from '@face-recognition-demo/shared/entities';

export interface Tables {
  faces: Face;
  kysely_migration: {
    name: string;
    timestamp: string;
  };
}
