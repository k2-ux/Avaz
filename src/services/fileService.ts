import RNFS from 'react-native-fs';

export const fileService = {
  async deleteFile(path: string) {
    try {
      const exists = await RNFS.exists(path);

      if (exists) {
        await RNFS.unlink(path);
      }
    } catch (error) {
      console.log('File delete error', error);
    }
  },
};
