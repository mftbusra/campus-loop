import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'; // 1. Added Image here
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-5">
      <Text className="text-3xl font-bold mb-10 text-blue-600">Campus Loop</Text> 
      
      {/* 2. Removed the extra <View> that was causing the tag mismatch */}
      <Image 
        source={require('../assets/logo.png')} 
        style={{ width: 150, height: 150, marginBottom: 20 }}
        resizeMode="contain"
      />
      
      {/* Email Input */}
      <TextInput 
        placeholder="Enter Email" 
        className="w-full bg-white p-4 rounded-lg mb-4 shadow-sm"
      />

      {/* Login Button */}
      <TouchableOpacity 
        className="w-full bg-blue-500 p-4 rounded-lg items-center"
        onPress={() => router.push('/home')} 
      >
        <Text className="text-white font-bold text-lg">Login</Text>
      </TouchableOpacity>
    </View>
  );
}
