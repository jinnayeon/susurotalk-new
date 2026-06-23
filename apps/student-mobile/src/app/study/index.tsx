import { View, Text, StyleSheet } from 'react-native'
import { AppHeader } from '../../components/AppHeader'

export default function StudyScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="학습 화면" />
      <Text style={styles.text}>학습 화면 (준비 중)</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E7', paddingHorizontal: 24, paddingTop: 24 },
  text: { fontSize: 18, color: '#7A6152' },
})
