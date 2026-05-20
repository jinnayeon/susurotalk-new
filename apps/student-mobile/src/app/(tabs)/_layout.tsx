import { Tabs } from 'expo-router'
import { Text } from 'react-native'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#FFF8E7', borderTopColor: '#E8D5B7' },
        tabBarActiveTintColor: '#F4A428',
        tabBarInactiveTintColor: '#A89080',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: '홈', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text> }}
      />
      <Tabs.Screen
        name="planner"
        options={{ title: '오늘공부', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📚</Text> }}
      />
      <Tabs.Screen
        name="store"
        options={{ title: '내기록', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⭐</Text> }}
      />
    </Tabs>
  )
}
