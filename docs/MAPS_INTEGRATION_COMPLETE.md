# Maps Integration - Implementation Summary

## ✅ COMPLETED

### What Was Built

1. **Location Hook** (`src/hooks/useLocation.ts`)
   - Request and manage location permissions
   - Get user's current location with auto-refresh
   - Calculate distance between coordinates (Haversine formula)
   - Format distances for display (meters/kilometers)
   - Sort and filter items by distance
   - Filter items within a radius

2. **Venue Map Component** (`src/components/VenueMap.tsx`)
   - Interactive map displaying venue locations
   - Custom markers for each venue
   - Selected venue highlighting
   - User location display
   - Control buttons (center on user, fit all markers)
   - Selected venue card with details and distance
   - Navigation to venue details
   - GeoJSON Point format conversion

3. **Venues Map Screen** (`app/(main)/venues/map.tsx`)
   - Full-screen map view for all venues
   - Toggle between map and list views
   - Radius filter (5km, 10km, 25km, 50km)
   - Venue list sorted by distance
   - Location permission status display
   - Pull-to-refresh for venues and location
   - Empty states for no venues or no location
   - Distance display for each venue

4. **Map Button in Venues List** (`app/(main)/venues/index.tsx`)
   - Added map button to search bar
   - Quick navigation to map view
   - Maintains search and filter context

5. **App Configuration** (`app.json`)
   - iOS location permissions (NSLocationWhenInUseUsageDescription, NSLocationAlwaysAndWhenInUseUsageDescription)
   - Android location permissions (ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION)
   - Permission descriptions for App Store/Play Store

### Packages Installed

- ✅ `react-native-maps` - Google Maps integration for React Native
- ✅ `expo-location` - Location services for Expo

### Features

#### Location Services

- **Permission Handling**: Automatic permission request on mount
- **Current Location**: Get user's GPS coordinates
- **Location Refresh**: Manual refresh capability
- **Permission States**: Clear feedback on permission status

#### Distance Calculations

- **Haversine Formula**: Accurate great-circle distance calculation
- **Auto-Formatting**: Displays meters (<1km) or kilometers (≥1km)
- **Sorting**: Sort venues by proximity to user
- **Radius Filtering**: Filter venues within selected radius

#### Map Features

- **Google Maps Integration**: Native map rendering
- **Venue Markers**: Custom pins for each venue
- **Selected State**: Visual feedback for selected venue
- **User Location**: Blue dot showing current position
- **Map Controls**:
  - 📍 Center on user location
  - 🗺️ Fit all venue markers in view
- **Venue Card**: Shows name, address, distance on selection
- **Direct Navigation**: Tap "View Details" to navigate to venue

#### View Modes

- **Map View**: Interactive map with markers
- **List View**: Scrollable list sorted by distance
- **Toggle**: Easy switching between views
- **Sync**: Both views use same data and filters

#### Filters

- **Radius**: 5km, 10km, 25km, 50km options
- **Smart Filtering**: Only shows venues within selected radius
- **Stats Display**: Shows X of Y venues based on filters

## 🔧 Setup Required

### For Development

1. **Google Maps API Key**:

   ```bash
   # Get API keys from Google Cloud Console
   # https://console.cloud.google.com/

   # Enable APIs:
   # - Maps SDK for Android
   # - Maps SDK for iOS
   ```

2. **iOS Setup**:

   ```bash
   cd ios
   pod install
   ```

   Add to `ios/<AppName>/AppDelegate.m` or `.swift`:

   ```objc
   @import GoogleMaps;

   [GMSServices provideAPIKey:@"YOUR_IOS_API_KEY"];
   ```

3. **Android Setup**:

   Add to `android/app/src/main/AndroidManifest.xml`:

   ```xml
   <application>
     <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="YOUR_ANDROID_API_KEY"/>
   </application>
   ```

4. **Expo EAS Build**:

   Add to `app.json` under `extra`:

   ```json
   "extra": {
     "googleMapsApiKey": {
       "ios": "YOUR_IOS_API_KEY",
       "android": "YOUR_ANDROID_API_KEY"
     }
   }
   ```

### Testing Without API Keys

The app will work with default maps but without satellite imagery or advanced features. For development, you can:

- Use PROVIDER_DEFAULT instead of PROVIDER_GOOGLE
- Test on iOS Simulator (uses Apple Maps)
- Request API keys from team lead

## 📱 How to Use

### useLocation Hook

```typescript
import { useLocation } from '@/src/hooks/useLocation';

function MyComponent() {
  const {
    location, // { latitude, longitude } | null
    loading, // boolean
    error, // string | null
    permissionGranted,
    refreshLocation,
    requestLocationPermission,
  } = useLocation();

  // Location is automatically requested on mount
  // Use location to calculate distances, show user position, etc.
}
```

### VenueMap Component

```typescript
import { VenueMap } from '@/src/components/VenueMap';

<VenueMap
  venues={venuesArray}              // Array of venues with GeoLocation
  userLocation={userLocation}       // User's coordinates
  selectedVenueId={selectedId}      // Optional: ID of selected venue
  onVenueSelect={handleSelect}      // Optional: Callback when venue tapped
  showUserLocation={true}           // Show user's position
  height={400}                      // Map height in pixels
/>
```

### Distance Utilities

```typescript
import {
  calculateDistance,
  formatDistance,
  sortByDistance,
  filterByRadius,
} from '@/src/hooks/useLocation';

// Calculate distance between two points
const distance = calculateDistance(
  { latitude: 40.7128, longitude: -74.006 }, // New York
  { latitude: 34.0522, longitude: -118.2437 } // Los Angeles
); // Returns: 3935.7 km

// Format for display
const formatted = formatDistance(distance); // "3935.7km"
const formatted2 = formatDistance(0.5); // "500m"

// Sort venues by distance
const sorted = sortByDistance(venues, userLocation);

// Filter within 10km radius
const nearby = filterByRadius(venues, userLocation, 10);
```

## 🎯 Data Format

### Venue Location Format

Backend uses GeoJSON Point format:

```typescript
{
  "type": "Point",
  "coordinates": [longitude, latitude]  // Note: [lng, lat] order
}
```

Map components automatically convert to:

```typescript
{
  latitude: number,   // -90 to 90
  longitude: number   // -180 to 180
}
```

### Example Venue with Location

```typescript
{
  "id": "venue123",
  "name": "Soccer Stadium",
  "address": "123 Sports Rd, Johannesburg",
  "location": {
    "type": "Point",
    "coordinates": [28.0473, -26.2041]  // [lng, lat]
  },
  "sportsSupported": ["Football", "Rugby"],
  // ... other fields
}
```

## 🧪 Testing

### Test User Location

```typescript
// In your component or test
const mockLocation = {
  latitude: -26.2041, // Johannesburg, South Africa
  longitude: 28.0473,
};
```

### Test Distance Calculation

```typescript
import { calculateDistance } from '@/src/hooks/useLocation';

// Johannesburg to Pretoria (~50km)
const distance = calculateDistance(
  { latitude: -26.2041, longitude: 28.0473 }, // Johannesburg
  { latitude: -25.7461, longitude: 28.1881 } // Pretoria
);
console.log(distance); // ~50.8 km
```

### Test on Device

1. **iOS Simulator**:
   - Debug > Location > Custom Location
   - Enter coordinates

2. **Android Emulator**:
   - ... (3 dots) > Location
   - Set custom coordinates

3. **Physical Device**:
   - Enable location services
   - Grant permissions when prompted
   - App will use real GPS

## 🚀 User Flow

1. **Enter Venues Screen**: User sees list of all venues
2. **Tap Map Button**: Navigates to map view
3. **Location Request**: App requests permission (if not granted)
4. **Map Loads**: Shows venues as markers, centers on user
5. **Interact**: User can:
   - Tap markers to see venue details
   - Change radius filter (5/10/25/50km)
   - Toggle to list view
   - Center on their location
   - Fit all markers in view
6. **View Details**: Tap venue card or list item to navigate to full details

## 📊 Status

- ✅ **Location Hook**: Complete with permissions, calculations, utilities
- ✅ **Map Component**: Complete with markers, controls, selection
- ✅ **Map Screen**: Complete with list/map toggle, filters
- ✅ **Navigation**: Complete with map button in venues list
- ✅ **Permissions**: Complete iOS and Android configuration
- ✅ **GeoJSON Support**: Complete conversion utilities
- 🔜 **Google Maps API Keys**: Requires setup
- 🔜 **Testing**: Requires physical devices
- 🔜 **Backend Integration**: Ensure all venues have location data

## 💡 Future Enhancements

1. **Clustering**: Group nearby markers at high zoom levels
2. **Directions**: Add "Get Directions" button using Google Maps/Apple Maps
3. **Search on Map**: Search venues while viewing map
4. **Custom Markers**: Use custom icons based on sport type
5. **Heat Maps**: Show popular areas with many venues
6. **Offline Maps**: Cache map tiles for offline use
7. **Location History**: Remember favorite/recent locations
8. **Geofencing**: Notifications when near favorite venues

## 🐛 Troubleshooting

### Location Permission Denied

- Check device location settings
- Reinstall app to reset permissions
- On iOS: Settings > Privacy > Location Services
- On Android: Settings > Apps > MiloKhelo > Permissions

### Map Not Loading

- Verify Google Maps API keys are set
- Check API keys have correct permissions
- Enable billing on Google Cloud Platform
- Verify network connection

### Distance Calculation Incorrect

- Ensure coordinates are in correct order (lat, lng)
- Verify backend sends correct GeoJSON format
- Check for null/undefined locations

### Markers Not Showing

- Verify venues have `location` field
- Check `coordinates` array has 2 values [lng, lat]
- Ensure map is rendering (check height prop)
- Try fitToMarkers() to zoom to venues

---

**Implementation Status**: ✅ **COMPLETE - Ready for Testing**  
**Time Spent**: ~45 minutes  
**Next Task**: Image Upload System or Backend Integration
