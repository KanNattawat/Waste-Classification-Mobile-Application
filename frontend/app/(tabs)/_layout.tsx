import { Tabs } from 'expo-router'
import React from 'react'




const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: 'โฮม', headerShown: false }} />
      <Tabs.Screen
        name='recents'
        options={{ title: 'ประวัติ', headerShown: false }} />
      <Tabs.Screen
        name='profile'
        options={{ title: ' โปรไฟล์', headerShown: false }} />
    </Tabs>
  )
}

export default _layout
