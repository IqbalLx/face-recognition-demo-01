import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Config } from '@face-recognition-demo/shared/config';
import { db } from '@face-recognition-demo/shared/database';
import { sql } from 'kysely';

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
      console.log(await response.text());
      throw new Error(`Recognizer Error`);
    }

    const responseData = await response.json();
    if (responseData.results.length === 0) return [];

    // Extract the "embedding" key from the response
    const embeddings = responseData.results.map((result) => result.embedding);
    return embeddings[0] as number[];
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { message: `Hello ${+new Date()}` };
  });

  fastify.post(
    '/register',
    async function (req: FastifyRequest, res: FastifyReply) {
      const data = await req.file();

      const name = (data.fields.name as any).value as string;
      if (name === undefined)
        return res.status(422).send({ message: 'name must be defined' });

      const fileExt = data.filename.split('.')[1];
      const dataBuffer = await data.toBuffer();
      const dataBase64 = dataBuffer.toString('base64');

      const dataEmbedding = await getEmbedding(dataBase64, fileExt);
      if (dataEmbedding.length === 0) return res.status(204).send(null);

      const fmtDataEmbedding = `'[${dataEmbedding.join(',')}]'`;
      const face = await db
        .insertInto('faces')
        .values({
          name,
          vector: sql.raw(fmtDataEmbedding),
        })
        .returning(['id', 'name', 'created_at', 'updated_at'])
        .executeTakeFirst();

      return res.status(201).send(face);
    }
  );

  fastify.post(
    '/recognize',
    async function (req: FastifyRequest, res: FastifyReply) {
      const data = await req.file();

      const fileExt = data.filename.split('.')[1];
      const dataBuffer = await data.toBuffer();
      const dataBase64 = dataBuffer.toString('base64');

      const dataEmbedding = await getEmbedding(dataBase64, fileExt);
      if (dataEmbedding.length === 0) return res.status(204).send(null);

      const fmtDataEmbedding = `'[${dataEmbedding.join(',')}]'`;
      const predictions = await db
        .with('similarities', (db) =>
          db
            .selectFrom('faces as f')
            .select([
              'id',
              sql
                .raw(`cosine_distance(${fmtDataEmbedding}, vector)`)
                .as('value'),
            ])
        )
        .selectFrom('faces as f')
        .innerJoin('similarities as s', 's.id', 'f.id')
        .where('s.value', '<=', 0.5)
        .orderBy('s.value', 'asc')
        .limit(5)
        .select([
          'f.id',
          'f.name',
          's.value as similarity',
          sql<number>`(50 * (2 - s.value))`.as('similarity_perc'),
        ])
        .execute();

      return res.status(200).send(predictions);
    }
  );
}
