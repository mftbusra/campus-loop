import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// COORDINATES & STOPS
const CONNELLY_COORDS = { latitude: 40.0374, longitude: -75.3377 };
const CAMPUS_STOPS = [
    { id: 1, title: 'Connelly Center', description: 'Main Campus Pickup', ...CONNELLY_COORDS, type: 'hub' },
    { id: 2, title: 'Bryn Mawr', description: 'Movies & Dining', latitude: 40.0230, longitude: -75.3160, type: 'town' },
    { id: 3, title: 'Suburban Square', description: 'Ardmore - Trader Joes/Apple', latitude: 40.0086, longitude: -75.2902, type: 'town' },
    { id: 4, title: 'King of Prussia Mall', description: 'Mall Entrance', latitude: 40.0906, longitude: -75.3857, type: 'mall' },
];

export default function CampusLoopApp() {
  const [role, setRole] = useState(null); // 'student' or 'driver'
  const [location, setLocation] = useState(null);
  const [rideStatus, setRideStatus] = useState('idle');
  const [selectedStop, setSelectedStop] = useState(null);
  const mapRef = useRef(null);

  // 1. LOCATION PERMISSIONS & WATCHER
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location access is required for the loop to work.");
        return;
      }
      const initial = await Location.getCurrentPositionAsync({});
      setLocation(initial.coords);

      await Location.watchPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 5
      }, (newLoc) => {
        setLocation(newLoc.coords);
      });
    })();
  }, []);

  // 2. HELPER FUNCTIONS
  const getIconColor = (type) => {
    switch(type) {
      case 'hub': return '#005596'; 
      case 'city': return '#E11D48'; 
      default: return '#059669'; 
    }
  };

  const handleStopPress = (stop) => {
    if (!location) return;
    setRideStatus('selecting');
    setSelectedStop(stop);
    mapRef.current?.animateToRegion({
      ...stop,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 1000);
  };

  // 3. RENDER LOGIN/ROLE SELECTION
  if (!role) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.mainTitle}>Campus Loop</Text>
        <Image source={{ uri: 'https://via.placeholder.com/120' }} style={styles.logo} />
        <TouchableOpacity style={styles.button} onPress={() => setRole('student')}>
          <Text style={styles.buttonText}>Enter as Student</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#10b981' }]} onPress={() => setRole('driver')}>
          <Text style={styles.buttonText}>Enter as Driver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 4. MAIN INTERFACE (SHARED MAP)
  return (
    <View style={{ flex: 1 }}>
      {/* MAP VIEW */}
      <View style={{ height: '60%' }}>
        {!location ? (
          <View style={styles.centerContainer}><ActivityIndicator size="large" color="#005596" /></View>
        ) : (
          <MapView 
            ref={mapRef}
            style={{ flex: 1 }}
            provider={null} // CRITICAL: Prevents APK crash by using standard tiles
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
          >
            {CAMPUS_STOPS.map((stop) => (
              <Marker
                key={stop.id}
                coordinate={stop}
                title={stop.title}
                pinColor={getIconColor(stop.type)}
                onPress={() => handleStopPress(stop)}
              />
            ))}
          </MapView>
        )}
      </View>

      {/* BOTTOM UI PANEL */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>{role === 'driver' ? "Driver Dashboard" : "Student Loop"}</Text>
          <TouchableOpacity onPress={() => setRole(null)}><Text style={{color: 'red'}}>Logout</Text></TouchableOpacity>
        </View>

        <ScrollView>
          {role === 'driver' ? (
            <View>
              <Text style={styles.infoText}>Broadcasting GPS to Students...</Text>
              <View style={styles.card}>
                <Text style={{fontWeight: 'bold'}}>Current Status: Active</Text>
                <Text>Students Waiting: 12</Text>
              </View>
              <TouchableOpacity style={styles.button}><Text style={styles.buttonText}>Next Stop: Connelly</Text></TouchableOpacity>
            </View>
          ) : (
            <View>
               {rideStatus === 'idle' ? (
                 CAMPUS_STOPS.map(stop => (
                   <TouchableOpacity key={stop.id} style={styles.stopItem} onPress={() => handleStopPress(stop)}>
                     <Ionicons name="bus" size={20} color={getIconColor(stop.type)} />
                     <Text style={{marginLeft: 10, fontWeight: '500'}}>{stop.title}</Text>
                   </TouchableOpacity>
                 ))
               ) : (
                 <View style={styles.card}>
                   <Text style={styles.cardTitle}>Selected: {selectedStop?.title}</Text>
                   <Text>Estimated Arrival: 4 Mins</Text>
                   <TouchableOpacity style={styles.button} onPress={() => setRideStatus('idle')}><Text style={styles.buttonText}>Cancel Request</Text></TouchableOpacity>
                 </View>
               )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6', padding: 20 },
  mainTitle: { fontSize: 36, fontWeight: 'bold', color: '#1e40af', marginBottom: 20 },
  logo: { width: 120, height: 120, borderRadius: 60, marginBottom: 40 },
  button: { backgroundColor: '#3b82f6', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  panel: { flex: 1, backgroundColor: 'white', marginTop: -20, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, shadowOpacity: 0.1, elevation: 5 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  panelTitle: { fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#eff6ff', padding: 15, borderRadius: 12, marginVertical: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  stopItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoText: { color: '#6b7280', marginBottom: 10 }
});
