import { Tabs } from 'expo-router'
import React from 'react'
import { View, Text } from 'react-native'

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen 
      name="index"
      options={{ title: 'Home', headerShown: false }} />
      <Tabs.Screen
      name='recents'
      options={{title: 'Recents', headerShown: false}}/>
    </Tabs>
  )
}

export default _layout
