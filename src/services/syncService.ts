import { fetchAuthSession } from 'aws-amplify/auth';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import { storageService } from './storageService';
import { uploadAudio } from './s3Service';

async function ensureCredentials() {
  console.log('====================================');
  console.log('SYNC DEBUG: Checking AWS credentials');

  for (let i = 0; i < 10; i++) {
    console.log(`Credential attempt: ${i + 1}/10`);

    try {
      const session = await fetchAuthSession();

      console.log('SESSION RAW:', session);

      if (session.tokens) {
        console.log('Auth tokens present');
      } else {
        console.log('No auth tokens yet');
      }

      if (session.credentials) {
        console.log('AWS credentials received');
      } else {
        console.log('AWS credentials missing');
      }

      if (session.identityId) {
        console.log('Identity ID:', session.identityId);
      } else {
        console.log('Identity ID missing');
      }

      if (session.credentials && session.identityId) {
        console.log('AWS credentials READY');
        console.log('====================================');
        return session;
      }
    } catch (err) {
      console.log('Credential fetch error:', err);
    }

    console.log('Waiting 1 second before retry...');
    await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));
  }

  console.log('====================================');
  console.log('FAILED: Unable to obtain AWS credentials');
  console.log('====================================');

  throw new Error('Unable to obtain AWS credentials');
}

export async function syncEntries() {
  console.log('====================================');
  console.log('SYNC STARTED');

  const entries = storageService.getEntries();

  console.log('Total entries in storage:', entries.length);

  const unsynced = entries.filter(e => !e.synced);

  console.log('Unsynced entries count:', unsynced.length);

  if (unsynced.length === 0) {
    console.log('Nothing to upload, exiting sync');
    console.log('====================================');
    return;
  }

  let session;

  try {
    session = await ensureCredentials();
  } catch (err) {
    console.log('Credential acquisition failed. Sync aborted.');
    console.log(err);
    return;
  }

  console.log('Using identityId:', session.identityId);

  for (const entry of unsynced) {
    console.log('------------------------------------');
    console.log('Processing entry:', entry.id);

    try {
      if (!entry.audioPath) {
        console.log('Entry missing audioPath, skipping');
        continue;
      }

      const cleanPath = entry.audioPath.replace('file://', '');

      console.log('Audio file path:', cleanPath);

      const exists = await RNFS.exists(cleanPath);

      if (!exists) {
        console.log('File does not exist, skipping entry');
        continue;
      }

      console.log('Reading audio file...');

      const base64 = await RNFS.readFile(cleanPath, 'base64');

      console.log('File read successful, converting buffer');

      const buffer = Buffer.from(base64, 'base64');

      console.log('Uploading to S3...');

      const key = await uploadAudio(buffer, `${entry.id}.m4a`);

      console.log('Upload success, S3 key:', key);

      entry.synced = true;
      entry.audioUrl = key;

      console.log('Deleting local file...');

      await RNFS.unlink(cleanPath);

      console.log('Local file deleted');
    } catch (err) {
      console.log('Upload failed for entry:', entry.id);
      console.log('Error details:', err);
    }
  }

  try {
    storageService.saveEntries(entries);
    console.log('Entries saved to local storage');
  } catch (err) {
    console.log('Failed saving entries:', err);
  }

  console.log('SYNC COMPLETE');
  console.log('====================================');
}
