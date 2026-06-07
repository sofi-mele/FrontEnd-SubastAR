import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/constants/theme';
import type { FileUpload } from '@/types/domain';

export function PhotoPreview({ file, onRemove }: { file: FileUpload; onRemove: () => void }) {
  return (
    <View style={styles.previewWrap}>
      <Image source={{ uri: file.uri }} style={styles.preview} />
      <Pressable style={styles.removePhoto} onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Eliminar ${file.name}`}>
        <Ionicons name="close" size={16} color="#FFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  previewWrap: { position: 'relative' },
  preview: { height: 94, width: 94, borderRadius: radius.md },
  removePhoto: { position: 'absolute', right: -5, top: -5, height: 23, width: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.danger },
});
