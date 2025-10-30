# Push Notifications Setup Guide

## Overview

The MiloKhelo app now has full push notification support using Expo's notification system. This enables real-time alerts for matches, tournaments, team invitations, and chat messages.

## ✅ What's Been Implemented

### 1. **Push Notification Service** (`src/services/pushNotifications.ts`)

Complete service with:

- ✅ Permission requests (iOS & Android)
- ✅ Token registration with Expo Push Token
- ✅ Android notification channels (matches, invitations, messages)
- ✅ Local notification scheduling
- ✅ Badge management
- ✅ Notification listeners setup

### 2. **React Hook** (`src/hooks/usePushNotifications.ts`)

Custom hook providing:

- ✅ Automatic token registration
- ✅ Backend token sync via API
- ✅ Deep linking on notification tap
- ✅ Badge clearing on notification open
- ✅ Permission status checking

### 3. **App Configuration** (`app.json`)

- ✅ iOS background mode for remote notifications
- ✅ Android permissions (RECEIVE_BOOT_COMPLETED, VIBRATE, WAKE_LOCK)
- ✅ Notification icon and color configuration
- ✅ Default notification channel setup

## 🚀 Setup Instructions

### Step 1: Configure EAS Project ID

1. If you haven't already, create an Expo account and project:

   ```bash
   npm install -g eas-cli
   eas login
   eas init
   ```

2. The `projectId` will be automatically added to `app.json` under `extra.eas.projectId`

### Step 2: Firebase Setup for Android (FCM)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Add an Android app with package name: `com.milokhelo.app`
4. Download `google-services.json`
5. Place it in the project root: `./google-services.json`

6. In Firebase Console, get your Server Key:
   - Go to Project Settings → Cloud Messaging
   - Copy the Server Key
   - Send this to your backend team to configure FCM

### Step 3: Apple Push Notification Setup (APNs)

1. Create an Apple Developer account
2. Generate an APNs Key:
   - Go to [Apple Developer](https://developer.apple.com/account/resources/authkeys/)
   - Create a new key with Apple Push Notifications enabled
   - Download the `.p8` file
   - Note the Key ID and Team ID

3. Upload to Expo:

   ```bash
   eas credentials
   ```

   - Select iOS → Production → Push Notifications
   - Upload your `.p8` file and enter Key ID and Team ID

### Step 4: Add Notification Assets

Create notification assets in the `assets/` folder:

1. **Notification Icon** (`notification-icon.png`)
   - Size: 96x96px for Android
   - Transparent background
   - White icon for best visibility

2. **Notification Sound** (Optional) (`notification-sound.wav`)
   - Format: WAV or MP3
   - Duration: 1-2 seconds recommended

### Step 5: Environment Variables

Add to your `.env` file:

```env
EXPO_PROJECT_ID=your-project-id-here
```

## 📱 Usage in App

### Initialize Push Notifications

In your root layout (`app/_layout.tsx`), add the hook:

```tsx
import { usePushNotifications } from '@/src/hooks/usePushNotifications';

export default function RootLayout() {
  // Initialize push notifications
  const { expoPushToken, isRegistered } = usePushNotifications();

  useEffect(() => {
    if (isRegistered && expoPushToken) {
      console.log('Push notifications registered:', expoPushToken);
    }
  }, [isRegistered, expoPushToken]);

  // ... rest of your layout
}
```

### Deep Linking Routes

The notification handler automatically navigates to:

- `/matches/{matchId}` - For match notifications
- `/tournaments/{tournamentId}` - For tournament notifications
- `/teams/{teamId}` - For team notifications
- `/notifications` - For invitations
- `/chat/{roomId}` - For chat messages

### Notification Data Format

When sending from backend, use this format:

```json
{
  "to": "ExponentPushToken[xxxxx]",
  "title": "New Match Invitation",
  "body": "You've been invited to join a football match",
  "data": {
    "type": "match",
    "matchId": "123",
    "screen": "/matches/123"
  },
  "sound": "default",
  "badge": 1,
  "priority": "high",
  "channelId": "matches"
}
```

## 🧪 Testing

### Test with Expo Push Notification Tool

1. Get your Expo Push Token from the app console
2. Go to [Expo Push Notification Tool](https://expo.dev/notifications)
3. Enter your token and send a test notification

### Test Local Notifications

```typescript
import { scheduleLocalNotification } from '@/src/services/pushNotifications';

// Schedule a test notification
await scheduleLocalNotification(
  'Test Title',
  'Test Body',
  { type: 'test', testId: '123' },
  5 // seconds
);
```

## 🔔 Notification Channels (Android)

Pre-configured channels:

| Channel ID    | Name        | Importance | Use Case                   |
| ------------- | ----------- | ---------- | -------------------------- |
| `default`     | Default     | MAX        | General notifications      |
| `matches`     | Matches     | HIGH       | Match updates, invitations |
| `invitations` | Invitations | HIGH       | Team/tournament invites    |
| `messages`    | Messages    | HIGH       | Chat messages              |

## 📊 Backend Integration

Your backend needs to:

1. **Store Push Tokens**
   - Endpoint: `POST /api/notifications/register-token`
   - Body: `{ token: string, platform: 'ios' | 'android' }`

2. **Send Notifications**
   - Use Expo's Push API: `https://exp.host/--/api/v2/push/send`
   - Or use Expo Server SDK: `expo-server-sdk`

Example with Node.js:

```javascript
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

const messages = [
  {
    to: 'ExponentPushToken[xxxxx]',
    sound: 'default',
    body: 'You have a new match invitation!',
    data: { type: 'match', matchId: '123' },
  },
];

const chunks = expo.chunkPushNotifications(messages);
for (const chunk of chunks) {
  await expo.sendPushNotificationsAsync(chunk);
}
```

## 🎯 Notification Types & Data Schema

### Match Notifications

```json
{
  "type": "match",
  "matchId": "string",
  "action": "invitation" | "started" | "completed" | "cancelled"
}
```

### Tournament Notifications

```json
{
  "type": "tournament",
  "tournamentId": "string",
  "action": "invitation" | "started" | "bracket_updated"
}
```

### Team Notifications

```json
{
  "type": "team",
  "teamId": "string",
  "action": "invitation" | "member_joined" | "member_left"
}
```

### Chat Notifications

```json
{
  "type": "message",
  "roomId": "string",
  "senderId": "string",
  "senderName": "string"
}
```

## 🐛 Troubleshooting

### Notifications Not Received

1. **Check permissions**:

   ```typescript
   import { areNotificationsEnabled } from '@/src/services/pushNotifications';
   const enabled = await areNotificationsEnabled();
   console.log('Notifications enabled:', enabled);
   ```

2. **Verify token registration**:
   - Check app console for "Push token registered with backend"
   - Verify token is saved in backend database

3. **Test with physical device**:
   - Push notifications don't work on iOS Simulator
   - Use a real device for testing

### Android: Notifications Not Showing

1. Ensure `google-services.json` is in project root
2. Check Android notification settings on device
3. Verify notification channel configuration

### iOS: Notifications Not Working

1. Ensure APNs key is uploaded to Expo
2. Check iOS notification settings on device
3. Verify bundle identifier matches: `com.milokhelo.app`

## 📚 Resources

- [Expo Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notifications](https://developer.apple.com/documentation/usernotifications)

## ✅ Next Steps

1. ✅ Push notification infrastructure complete
2. 🔜 Test with physical devices
3. 🔜 Backend integration for sending notifications
4. 🔜 Add notification preferences in settings
5. 🔜 Implement quiet hours feature
6. 🔜 Add notification sound customization

---

**Status**: ✅ **Implementation Complete - Ready for Testing**  
**Last Updated**: 30 October 2025
