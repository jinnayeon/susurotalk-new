import { View, Text, StyleSheet } from 'react-native'

export default function StudyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>학습 화면 (준비 중)</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E7', justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: '#7A6152' },
})
