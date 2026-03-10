import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Buffer } from 'buffer';
import { getUrl } from 'aws-amplify/storage';

export async function uploadAudio(buffer: Buffer, filename: string) {
  console.log('Getting AWS session...');

  const session = await fetchAuthSession();

  if (!session.credentials || !session.identityId) {
    throw new Error('No AWS credentials');
  }

  const { accessKeyId, secretAccessKey, sessionToken } = session.credentials;

  const identityId = session.identityId;

  console.log('Identity ID:', identityId);

  const s3 = new S3Client({
    region: 'ap-south-1',
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken,
    },
  });

  const key = `users/${identityId}/${filename}`;

  console.log('Uploading to S3 key:', key);

  const command = new PutObjectCommand({
    Bucket: 'audiobucket38b06-dev',
    Key: key,
    Body: buffer,
    ContentType: 'audio/m4a',
  });

  await s3.send(command);

  console.log('Upload success');

  return key;
}

export async function getS3Url(key: string) {
  const result = await getUrl({
    path: key,
  });

  return result.url.toString();
}
