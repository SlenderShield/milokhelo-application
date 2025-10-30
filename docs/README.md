# MiloKhelo React Native App - Setup Instructions

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI (will be installed via npx)
- iOS Simulator (Mac only) or Android Emulator
- Physical device with Expo Go app (optional)

## Installation Steps

### 1. Install Dependencies

```bash
cd /home/slendershield/projects/milokhelo-application
npm install
```

### 2. Configure Environment

The `.env` file has been created with default values:

```env
API_BASE_URL=http://localhost:4000/api/v1
API_TIMEOUT=10000
NODE_ENV=development
```

**For device testing**, update `API_BASE_URL` to your local IP:
```env
API_BASE_URL=http://192.168.1.X:4000/api/v1
```

### 3. Start Development Server

```bash
# Start Expo dev server
npm start

# Or specific platform
npm run ios      # iOS Simulator (Mac only)
npm run android  # Android Emulator
npm run web      # Web browser
```

### 4. Run on Device

1. Install **Expo Go** app on your phone
2. Scan the QR code from the terminal
3. App will load on your device

## Project Structure

```
milokhelo-application/
├── app/                           # Expo Router screens
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Home screen
│   ├── (auth)/                   # Auth group
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   └── (main)/                   # Main app (protected)
│       ├── dashboard.tsx
│       ├── matches/
│       ├── tournaments.tsx
│       ├── teams.tsx
│       └── profile.tsx
│
├── src/
│   ├── api/
│   │   ├── client.ts            # Axios client with interceptors
│   │   ├── endpoints/           # API endpoint functions
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── matches.ts
│   │   │   ├── tournaments.ts
│   │   │   └── ...
│   │   ├── hooks/               # React Query hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useUsers.ts
│   │   │   ├── useMatches.ts
│   │   │   └── ...
│   │   └── models/              # Zod schemas & TypeScript types
│   │       ├── Auth.ts
│   │       ├── User.ts
│   │       ├── Match.ts
│   │       └── ...
│   │
│   ├── config/
│   │   ├── env.ts               # Environment config
│   │   └── apiConfig.ts         # API configuration
│   │
│   └── context/
│       └── AuthContext.tsx      # Auth state management
│
├── docs/
│   ├── api_reference.md         # Complete API documentation
│   ├── navigation_map.md        # Route mapping guide
│   └── README.md               # This file
│
├── package.json
├── tsconfig.json
├── app.json
├── .env
└── .gitignore
```

## Key Features

### ✅ Generated Features

1. **Complete API Layer**
   - 12+ endpoint files covering all resources
   - Type-safe API calls with Zod validation
   - Automatic error handling and retries
   - Token refresh on 401 errors

2. **React Query Integration**
   - Hooks for all API operations
   - Automatic caching and revalidation
   - Optimistic updates
   - Query key management

3. **Authentication System**
   - Session-based auth with cookies
   - Token management with SecureStore
   - Protected routes
   - Auto-redirect on auth state change

4. **Expo Router v3 Navigation**
   - File-based routing
   - Nested layouts
   - Tab navigation in main app
   - Dynamic routes for details

5. **Type Safety**
   - Strict TypeScript
   - Zod runtime validation
   - Auto-generated types from API

6. **UI Screens**
   - Login/Register
   - Dashboard
   - Matches list and detail
   - Profile
   - Placeholder screens for teams, tournaments

## Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in web browser
npm run lint       # Lint code (if configured)
npm run type-check # TypeScript type checking
```

## API Integration

### Using API Hooks

```typescript
import { useGetMatches, useJoinMatch } from '@/src/api/hooks';

function MatchesScreen() {
  // Query hook - auto-fetches and caches
  const { data: matches, isLoading, error } = useGetMatches();

  // Mutation hook - for POST/PUT/DELETE
  const joinMatch = useJoinMatch();

  const handleJoin = async (matchId: string) => {
    await joinMatch.mutateAsync(matchId);
  };

  // ...
}
```

### Authentication

```typescript
import { useAuth } from '@/src/context/AuthContext';

function MyScreen() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <WelcomeMessage user={user} />;
}
```

## Backend API Requirements

Ensure your backend API is running and accessible:

1. **Local Development**: Backend at `http://localhost:4000`
2. **Device Testing**: Backend at `http://<YOUR_LOCAL_IP>:4000`
3. **Session Cookies**: Backend must support CORS and credentials
4. **Endpoints**: Must match OpenAPI spec structure

### Backend Setup

```bash
# Make sure backend is running
cd /path/to/backend
npm start

# Backend should be accessible at http://localhost:4000
```

## Testing Authentication Flow

1. Start the app: `npm start`
2. Navigate to Register screen
3. Create account with:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Login with credentials
5. Access protected screens (Dashboard, Matches, etc.)

## Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution**: 
- Verify backend is running
- Check `.env` file has correct API URL
- For physical device, use local IP not localhost

### Issue: "Module not found" errors
**Solution**:
```bash
rm -rf node_modules
npm install
npm start -- --reset-cache
```

### Issue: TypeScript errors
**Solution**:
```bash
npm run type-check
# Fix reported errors
```

### Issue: "Expo Go incompatibility"
**Solution**: Some features may require custom dev client. See [Expo docs](https://docs.expo.dev/development/getting-started/).

## Next Steps

### Immediate Todos
1. ✅ Install dependencies
2. ✅ Configure `.env` with backend URL
3. ✅ Start dev server
4. ✅ Test authentication flow
5. ⏳ Implement remaining screens (Teams, Tournaments, Venues)
6. ⏳ Add more React Query hooks for all endpoints
7. ⏳ Implement WebSocket for real-time chat
8. ⏳ Add push notifications
9. ⏳ Implement Google Calendar OAuth flow
10. ⏳ Add map integration for venues

### Enhancement Ideas
- Add dark mode support
- Implement image upload for profiles/teams
- Add offline support with React Query persistence
- Implement real-time match updates
- Add analytics tracking
- Implement deep linking for shared content
- Add biometric authentication
- Create onboarding flow for new users

## Documentation

- **API Reference**: See `docs/api_reference.md`
- **Navigation Guide**: See `docs/navigation_map.md`
- **OpenAPI Spec**: See `openapi.yaml`

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React Native + Expo |
| Routing | Expo Router v3 |
| Language | TypeScript (strict) |
| State Management | @tanstack/react-query |
| HTTP Client | Axios |
| Validation | Zod |
| Auth Storage | expo-secure-store |
| Icons | @expo/vector-icons |

## Production Checklist

Before deploying to production:

- [ ] Update `.env` with production API URL
- [ ] Enable error tracking (Sentry, etc.)
- [ ] Add analytics
- [ ] Test on multiple devices
- [ ] Implement crash reporting
- [ ] Add app icons and splash screen
- [ ] Configure build settings in `app.json`
- [ ] Set up CI/CD pipeline
- [ ] Add proper error boundaries
- [ ] Implement rate limiting on client
- [ ] Add telemetry and monitoring

## Support

For issues or questions:
1. Check `docs/api_reference.md`
2. Check `docs/navigation_map.md`
3. Review Expo Router docs: https://expo.github.io/router
4. Review React Query docs: https://tanstack.com/query

## License

[Your License Here]

---

**Generated by**: AI Assistant
**Date**: $(date)
**OpenAPI Version**: v1
