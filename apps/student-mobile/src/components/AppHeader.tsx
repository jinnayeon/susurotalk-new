import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

interface AppHeaderProps {
  title: string
  showBack?: boolean
}

export function AppHeader({ title, showBack = true }: AppHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }

    router.replace('/(tabs)/')
  }

  return (
    <View style={styles.header}>
      {showBack ? (
        <Pressable hitSlop={10} onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ 뒤로</Text>
        </Pressable>
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.backPlaceholder} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 48,
  },
  backButton: {
    minWidth: 72,
    paddingVertical: 8,
  },
  backPlaceholder: {
    minWidth: 72,
  },
  backText: {
    color: '#7A6152',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: '#3D2B1F',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
})
