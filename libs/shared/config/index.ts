import { DatabaseConfig } from './src/database.config';
import { FaceRecognizerConfig } from './src/faceRecognizer.config';

export const Config = {
  database: new DatabaseConfig(),
  faceRecognizer: new FaceRecognizerConfig(),
};

export type Config = typeof Config;
