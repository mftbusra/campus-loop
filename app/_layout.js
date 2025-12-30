import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      {/* 1. Standard Screens (No Header, Slide from Right) */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      
      {/* 2. The Profile Screen (No Header, SLIDE FROM BOTTOM) */}
      <Stack.Screen 
        name="profile" 
        options={{ 
            headerShown: false,
            presentation: 'modal', // <--- This enables the card animation
        }} 
      />
    </Stack>
  );
}