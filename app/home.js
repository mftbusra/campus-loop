import React, { useEffect, useState, useRef } from 'react';    
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// 1. HARDCODED CONNELLY CENTER (The Hub)
const CONNELLY_COORDS = { latitude: 40.0374, longitude: -75.3377 };

const CAMPUS_STOPS = [
    { id: 1, title: 'Connelly Center', description: 'Main Campus Pickup', ...CONNELLY_COORDS, type: 'hub' },
    { id: 2, title: 'Bryn Mawr', description: 'Movies & Dining', latitude: 40.0230, longitude: -75.3160, type: 'town' },
    { id: 3, title: 'Suburban Square', description: 'Ardmore - Trader Joes/Apple', latitude: 40.0086, longitude: -75.2902, type: 'town' },
    { id: 4, title: 'King of Prussia Mall', description: 'Mall Entrance (Nordstrom)', latitude: 40.0906, longitude: -75.3857, type: 'mall' },
    { id: 5, title: '30th St. Station', description: 'Amtrak & Septa Hub', latitude: 39.9558, longitude: -75.1820, type: 'city' },
    { id: 6, title: 'City Hall', description: 'Center City Phila', latitude: 39.9526, longitude: -75.1652, type: 'city' },
];

export default function HomeScreen() {
  const router = useRouter();
  
  const [location, setLocation] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null); 
  
  // STATUS FLOW: 'idle' -> 'selecting' -> 'booked' -> 'riding'
  const [rideStatus, setRideStatus] = useState('idle'); 
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      // Watch position for "On Board" phase
      await Location.watchPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 10
      }, (newLoc) => {
        setLocation(newLoc.coords);
      });
    })();
  }, []);

  // REAL-TIME UPDATER: Only active when "riding"
  // This updates the black line to follow the bus
  useEffect(() => {
    if (rideStatus === 'riding' && location && selectedStop) {
        const livePath = calculateRoutePath(location, selectedStop);
        setSelectedStop(prev => ({ ...prev, path: livePath }));
    }
  }, [location, rideStatus]); 

  // Helper: Simple L-Shape Route Logic
  const calculateRoutePath = (start, end) => {
    const turnPoint = {
        latitude: start.latitude,      
        longitude: end.longitude, 
    };
    return [
        { latitude: start.latitude, longitude: start.longitude }, 
        turnPoint, 
        { latitude: end.latitude, longitude: end.longitude } 
    ];
  }

  // ACTION: User taps a destination
  const handleStopPress = (stop) => {
    if (!location) return;
    setRideStatus('selecting');

    // ROUTE LOGIC (Calculated IMMEDIATELY):
    // 1. Inbound (to Campus): Start line at USER.
    // 2. Outbound (to Mall): Start line at CONNELLY.
    const isInbound = stop.title === 'Connelly Center';
    const startPoint = isInbound ? location : CONNELLY_COORDS;

    // Generate the path coordinates
    const routePath = calculateRoutePath(startPoint, stop);

    // Update state - this triggers the black line on the map instantly
    setSelectedStop({
        ...stop,
        path: routePath
    });

    // Zoom map to show the entire route clearly
    mapRef.current?.fitToCoordinates([startPoint, stop], {
        edgePadding: { top: 50, right: 50, bottom: 300, left: 50 },
        animated: true,
    });
  };

  const bookShuttle = () => {
    setRideStatus('searching'); 
    setTimeout(() => {
        setRideStatus('booked'); 
        // Line does NOT change here. It stays static.
    }, 2000);
  };

  const startRide = () => {
      setRideStatus('riding'); 
      Alert.alert("Welcome Aboard", "The map is now tracking your ride.");
  };

  const cancelRide = () => {
    setRideStatus('idle');
    setSelectedStop(null);
  }

  const getIconColor = (type) => {
      switch(type) {
          case 'hub': return '#005596'; 
          case 'city': return '#E11D48'; 
          default: return '#059669'; 
      }
  };

  return (
    <View className="flex-1 bg-white">
      
      {/* Menu Button */}
      <TouchableOpacity onPress={() => router.push('/profile')} className="absolute top-12 left-5 z-50 bg-white p-3 rounded-full shadow-lg">
        <Ionicons name="menu" size={24} color="black" />
      </TouchableOpacity>

      {/* MAP SECTION */}
      <View className="h-3/5"> 
        {!location ? (
           <View className="flex-1 justify-center items-center bg-gray-200"><ActivityIndicator size="large" color="#005596" /></View>
        ) : (
          <MapView 
            ref={mapRef}
            className="flex-1"
            initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.1, 
                longitudeDelta: 0.1,
            }}
            showsUserLocation={true}
          >
              {CAMPUS_STOPS.map((stop) => (
                  <Marker
                    key={stop.id}
                    coordinate={stop}
                    title={stop.title}
                    onPress={() => handleStopPress(stop)}
                    pinColor={getIconColor(stop.type)}
                  />
              ))}

              {/* RENDER THE LINE IMMEDIATELY IF STOP IS SELECTED */}
              {selectedStop && (
                <Polyline 
                    coordinates={selectedStop.path} 
                    strokeColor="black" 
                    strokeWidth={4} 
                />
              )}
          </MapView>
        )}
      </View>

      {/* BOTTOM CONTROL PANEL */}
      <View className="flex-1 bg-white -mt-8 rounded-t-3xl shadow-2xl p-6">
        
        {/* PHASE 1: IDLE - PICK A STOP */}
        {rideStatus === 'idle' && (
            <>
                <Text className="text-xl font-bold mb-4 text-gray-800">Shuttle Destinations</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {CAMPUS_STOPS.map((stop) => (
                        <TouchableOpacity 
                            key={stop.id}
                            className="flex-row items-center p-4 border-b border-gray-100 bg-gray-50 mb-2 rounded-lg"
                            onPress={() => handleStopPress(stop)}
                        >
                            <View className="bg-white p-2 rounded-full mr-3 border border-gray-200">
                                <Ionicons name={stop.type === 'hub' ? "school" : stop.type === 'city' ? "business" : "cart"} size={24} color={getIconColor(stop.type)} />
                            </View>
                            <View>
                                <Text className="font-bold text-lg text-gray-800">{stop.title}</Text>
                                <Text className="text-gray-500">{stop.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </>
        )}

        {/* PHASE 2: SELECTING - SEE ROUTE & RESERVE */}
        {rideStatus === 'selecting' && selectedStop && (
            <>
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-xl font-bold">{selectedStop.title}</Text>
                        <Text className="text-gray-500">{selectedStop.title === 'Connelly Center' ? 'Inbound' : 'Outbound'}</Text>
                    </View>
                    <TouchableOpacity onPress={cancelRide}><Text className="text-red-500 font-bold">Cancel</Text></TouchableOpacity>
                </View>

                {/* Info Card */}
                <View className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100 flex-row justify-between items-center">
                    <View>
                        <Text className="text-blue-800 font-bold text-lg">Next Shuttle</Text>
                        <Text className="text-gray-600">Leaves in 5 mins</Text>
                    </View>
                    <View className="items-end"><Text className="font-bold text-black text-2xl">4:00<Text className="text-sm text-gray-500">PM</Text></Text></View>
                </View>

                {/* RESERVE BUTTON */}
                <TouchableOpacity className="bg-[#005596] p-4 rounded-xl mt-2 shadow-md flex-row justify-center items-center" onPress={bookShuttle}>
                    <Text className="text-white font-bold text-lg mr-2">Reserve Seat</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
            </>
        )}

        {/* PHASE 3: BOOKED - WAIT FOR BUS */}
        {rideStatus === 'booked' && (
            <View className="items-center justify-center flex-1">
                <Text className="text-2xl font-bold text-gray-800 mb-2">Seat Reserved!</Text>
                <Text className="text-gray-500 text-center px-10 mb-6">
                    Please wait at the station. Tap below when you board the bus.
                </Text>

                <TouchableOpacity 
                    className="bg-green-600 w-full p-4 rounded-xl shadow-md flex-row justify-center items-center mb-4"
                    onPress={startRide}
                >
                    <Ionicons name="bus" size={24} color="white" style={{ marginRight: 10 }} />
                    <Text className="text-white font-bold text-lg">I'm on the Bus</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={cancelRide}><Text className="text-red-500 font-bold">Cancel Reservation</Text></TouchableOpacity>
            </View>
        )}

        {/* PHASE 4: RIDING - LIVE TRACKING */}
        {rideStatus === 'riding' && (
            <View className="items-center justify-center flex-1">
                <View className="bg-red-100 p-4 rounded-full mb-4 animate-bounce">
                    <Ionicons name="navigate" size={40} color="#E11D48" />
                </View>
                <Text className="text-2xl font-bold text-gray-800">En Route</Text>
                <Text className="text-gray-500 text-center mt-2 px-10">
                    We are tracking your ride to {selectedStop.title}.
                </Text>
                
                <TouchableOpacity className="mt-8 bg-gray-100 px-8 py-3 rounded-full" onPress={cancelRide}>
                    <Text className="text-red-500 font-bold">Arrived / End Trip</Text>
                </TouchableOpacity>
            </View>
        )}

        {rideStatus === 'searching' && <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#005596" /></View>}

      </View>
    </View>
  );
}