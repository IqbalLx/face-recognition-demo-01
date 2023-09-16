import { ConfigKey, readenv } from '@face-recognition-demo/shared/utils';
import { BaseConfig } from './base.config';

export class FaceRecognizerConfig extends BaseConfig {
  constructor(
    keys: ConfigKey = {
      baseUrl: {
        envKey: 'FACE_RECOGNIZER_BASE_URL',
      },
      modelName: {
        envKey: 'FACE_RECOGNIZER_MODEL_NAME',
        default: 'Facenet',
      },
    }
  ) {
    super(keys);
  }

  get baseUrl() {
    return readenv(this.keys['baseUrl']);
  }

  get modelName() {
    return readenv(this.keys['modelName']);
  }
}
