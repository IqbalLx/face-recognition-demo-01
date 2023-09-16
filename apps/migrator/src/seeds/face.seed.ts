import { Config } from '@face-recognition-demo/shared/config';
import { Tables } from '@face-recognition-demo/shared/database';
import {
  listFilesInFolder,
  readImageFromFile,
} from '@face-recognition-demo/shared/utils';
import { Transaction, sql } from 'kysely';
import { join } from 'node:path';

Config.faceRecognizer.validate();

async function getEmbedding(imgBase64: string, imgExt: string) {
  const payload = JSON.stringify({
    model_name: Config.faceRecognizer.modelName,
    img_ext: imgExt,
    img: imgBase64,
  });

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
  };

  try {
    const response = await fetch(
      `${Config.faceRecognizer.baseUrl}/represent/base64`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();

    // Extract the "embedding" key from the response
    const embeddings = responseData.results.map((result) => result.embedding);
    return embeddings[0] as number[];
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

export async function seedFace(trx: Transaction<Tables>): Promise<void> {
  const faces = await trx
    .selectFrom('faces')
    .select((qb) => qb.fn.count('id').as('count'))
    .executeTakeFirst();

  if (Number(faces.count) > 0) {
    console.info('Faces seed already available. Skipping ...');
    return;
  }

  const SEED_FOLDER = `${__dirname}/faces/images`;
  const files = await listFilesInFolder(SEED_FOLDER);

  const imageBase64Reprs = await Promise.all(
    files.map((file) => readImageFromFile(join(SEED_FOLDER, file)))
  );

  const imageEmbeddingReprs = await Promise.all(
    files.map((filename, index) => {
      const imgExt = filename.split('.')[1];
      return getEmbedding(imageBase64Reprs[index], imgExt);
    })
  );

  const nameToEmbeddingReprKeyValues = files.map((filename, index) => {
    const name = filename.split('.')[0];
    return {
      name,
      embedding: imageEmbeddingReprs[index],
    };
  });

  await Promise.all(
    nameToEmbeddingReprKeyValues.map((record) => {
      return trx
        .insertInto('faces')
        .values({
          name: record.name,
          vector: sql.raw(`'[${record.embedding.join(', ')}]'`),
        })
        .execute();
    })
  );
}
