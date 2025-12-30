import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      
      {/* Header */}
      <View className="bg-white p-5 pt-12 flex-row justify-between items-center shadow-sm">
        <Text className="text-2xl font-bold">My Profile</Text>
        <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="p-5">
        
        {/* User Card */}
        <View className="bg-white p-5 rounded-xl flex-row items-center mb-6 shadow-sm">
            <View className="bg-blue-100 h-16 w-16 rounded-full items-center justify-center mr-4">
                <Text className="text-3xl">👤</Text>
            </View>
            <View>
                <Text className="text-xl font-bold">Rider One</Text>
                <Text className="text-gray-500">Gold Member • 4.9 ★</Text>
            </View>
        </View>

        {/* Menu Options */}
        <Text className="font-bold text-gray-500 mb-2 uppercase">Account</Text>
        <View className="bg-white rounded-xl overflow-hidden mb-6 shadow-sm">
            <MenuOption icon="time" label="Ride History" />
            <MenuOption icon="card" label="Payment Methods" />
            <MenuOption icon="settings" label="Settings" border={false} />
        </View>

        {/* Log Out */}
        <TouchableOpacity 
            className="bg-red-50 p-4 rounded-xl flex-row items-center justify-center mt-4"
            onPress={() => router.replace('/login')} // Resets navigation to login
        >
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text className="text-red-500 font-bold text-lg ml-2">Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// Helper Component for list items
function MenuOption({ icon, label, border = true }) {
    return (
        <TouchableOpacity className={`flex-row items-center p-4 ${border ? 'border-b border-gray-100' : ''}`}>
            <Ionicons name={icon} size={22} color="#4B5563" />
            <Text className="text-lg ml-3 flex-1 text-gray-700">{label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>
    );
}