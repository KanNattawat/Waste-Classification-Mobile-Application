import { Stack } from "expo-router";
import React from 'react';
import { useEffect } from "react";
const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  )
}

export default _layout
