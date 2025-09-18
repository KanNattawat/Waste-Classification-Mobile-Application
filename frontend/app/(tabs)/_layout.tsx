import { Tabs } from 'expo-router'
import React from 'react'




const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', headerShown: false }} />
      <Tabs.Screen
        name='recents'
        options={{ title: 'Recents', headerShown: false }} />
      <Tabs.Screen
        name='sign_in'
        options={{ title: 'sign_in', headerShown: false }} />
      <Tabs.Screen
        name='sign_up'
        options={{ title: 'sign_up', headerShown: false }} />
    </Tabs>
  )
}

export default _layout
