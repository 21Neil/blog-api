import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import path from 'path';

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const PUBLISHED_BUCKET = process.env.R2_PUBLISHED_BUCKET_NAME;
const UNPUBLISHED_BUCKET = process.env.R2_UNPUBLISHED_BUCKET_NAME;

const R2 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export const uploadFileToR2 = async (
  originalname,
  body,
  contentType,
  published
) => {
  const fileExtension = path.extname(originalname);
  const filename = crypto.randomUUID() + fileExtension;

  if (published)
    await R2.send(
      new PutObjectCommand({
        Bucket: PUBLISHED_BUCKET,
        Key: filename,
        Body: body,
        ContentType: contentType,
      })
    );

  if (!published)
    await R2.send(
      new PutObjectCommand({
        Bucket: UNPUBLISHED_BUCKET,
        Key: filename,
        Body: body,
        ContentType: contentType,
      })
    );

  return filename;
};

export const getFileFromR2 = async key => {
  return await R2.send(
    new GetObjectCommand({
      Bucket: UNPUBLISHED_BUCKET,
      Key: key,
    })
  );
};

export const publishedFileInR2 = async key => {
  await R2.send(
    new CopyObjectCommand({
      Bucket: PUBLISHED_BUCKET,
      Key: key,
      CopySource: UNPUBLISHED_BUCKET + '/' + key,
    })
  );

  await R2.send(
    new DeleteObjectCommand({
      Bucket: UNPUBLISHED_BUCKET,
      Key: key,
    })
  );
};

export const unpublishedFileInR2 = async key => {
  await R2.send(
    new CopyObjectCommand({
      Bucket: UNPUBLISHED_BUCKET,
      Key: key,
      CopySource: PUBLISHED_BUCKET + '/' + key,
    })
  );

  await R2.send(
    new DeleteObjectCommand({
      Bucket: PUBLISHED_BUCKET,
      Key: key,
    })
  );
};

export const deleteFileFromR2 = async (key, published) => {
  if (published)
    return await R2.send(
      new DeleteObjectCommand({
        Bucket: PUBLISHED_BUCKET,
        Key: key,
      })
    );

  if (!published)
    return await R2.send(
      new DeleteObjectCommand({
        Bucket: UNPUBLISHED_BUCKET,
        Key: key,
      })
    );
};
