import * as FileSystem from 'expo-file-system';

export const saveUserId = async (userId) => {
  try {
    const fileUri = FileSystem.documentDirectory + 'user_id.json';
    const jsonData = JSON.stringify({ user_id: userId });

    await FileSystem.writeAsStringAsync(fileUri, jsonData, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    console.log('✅ User ID saved to', fileUri);
  } catch (error) {
    console.error('❌ Error saving user ID:', error);
  }
};
