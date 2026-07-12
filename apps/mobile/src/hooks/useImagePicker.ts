import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export function useImagePicker() {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1, // Start with high quality, compress later
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      // Compress
      const compressed = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      const fileName = asset.fileName || `image-${Date.now()}.jpg`;
      return {
        uri: compressed.uri,
        name: fileName,
        mimeType: 'image/jpeg',
      };
    }
    return null;
  };

  return { pickImage };
}
