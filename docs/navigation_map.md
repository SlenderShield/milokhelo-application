# MiloKhelo Navigation Map

Auto-generated route-to-screen-to-API mapping for Expo Router structure.

## Route Structure

```
app/
├── _layout.tsx                    # Root layout with providers
├── index.tsx                      # Home/Landing screen
├── (auth)/                        # Authentication group
│   ├── _layout.tsx               # Auth layout
│   ├── login.tsx                 # Login screen
│   ├── register.tsx              # Register screen
│   └── forgot-password.tsx       # Password reset screen
└── (main)/                        # Main app group (protected)
    ├── _layout.tsx               # Tab navigation layout
    ├── dashboard.tsx             # Dashboard/Home
    ├── matches/                  # Matches section
    │   ├── _layout.tsx          # Stack layout for matches
    │   ├── index.tsx            # Match list
    │   └── [id].tsx             # Match detail
    ├── tournaments.tsx           # Tournaments list
    ├── teams.tsx                 # Teams list
    └── profile.tsx               # User profile
```

---

## Route → Screen → API Mapping

| Route | Screen | API Hooks | Description |
|-------|--------|-----------|-------------|
| `/` | Home | `useAuth()` | Landing page with login/register or dashboard |
| `/(auth)/login` | Login | `useLogin()` | Email/password login |
| `/(auth)/register` | Register | `useRegister()` | User registration |
| `/(auth)/forgot-password` | Forgot Password | `useForgotPassword()`, `useResetPassword()` | Password reset flow |
| `/(main)/dashboard` | Dashboard | `useAuth()` | Main dashboard with quick actions |
| `/(main)/matches` | Matches List | `useGetMatches()` | Browse all matches |
| `/(main)/matches/[id]` | Match Detail | `useGetMatchById(id)`, `useJoinMatch()`, `useLeaveMatch()` | View and interact with match |
| `/(main)/tournaments` | Tournaments | `useGetTournaments()` | Browse tournaments |
| `/(main)/teams` | Teams | `useGetTeams()` | Browse and manage teams |
| `/(main)/profile` | Profile | `useGetMyProfile()`, `useLogout()` | User profile and settings |

---

## Navigation Groups

### (auth) Group - Unauthenticated Routes
Routes accessible without authentication:
- `/login` - Login screen
- `/register` - Registration screen
- `/forgot-password` - Password reset

### (main) Group - Protected Routes
Routes requiring authentication (redirects to login if not authenticated):
- `/dashboard` - Main dashboard
- `/matches` - Match browsing and management
- `/tournaments` - Tournament browsing
- `/teams` - Team management
- `/profile` - User profile

---

## Detailed Screen Breakdown

### 1. Home Screen (`app/index.tsx`)

**Purpose**: Landing page that redirects based on auth status

**API Hooks**:
- `useAuth()` - Check authentication state

**Navigation Logic**:
- If authenticated → Show "Go to Dashboard" button
- If not authenticated → Show "Login" and "Register" buttons

---

### 2. Login Screen (`app/(auth)/login.tsx`)

**Purpose**: User login with email/password

**API Hooks**:
- `useLogin()` - Authenticate user

**Form Fields**:
- Email (validated)
- Password

**Navigation**:
- Success → Redirect to `/dashboard`
- "Forgot Password" → Navigate to `/forgot-password`
- "Register" → Navigate to `/register`

---

### 3. Register Screen (`app/(auth)/register.tsx`)

**Purpose**: New user registration

**API Hooks**:
- `useRegister()` - Create new account

**Form Fields**:
- Name
- Email
- Password
- Confirm Password

**Validation**:
- Password minimum 6 characters
- Passwords must match
- Email format validation

**Navigation**:
- Success → Redirect to `/login`
- "Login" → Navigate to `/login`

---

### 4. Dashboard Screen (`app/(main)/dashboard.tsx`)

**Purpose**: Main hub with quick access to features

**API Hooks**:
- `useAuth()` - Get current user

**Features**:
- Welcome message with user name
- Quick action cards for:
  - Matches
  - Tournaments
  - Teams
  - Profile
- Quick action buttons:
  - Find Nearby Venues
  - View Calendar
  - Messages

**Navigation**:
- Each card navigates to respective section

---

### 5. Matches List Screen (`app/(main)/matches/index.tsx`)

**Purpose**: Browse and search matches

**API Hooks**:
- `useGetMatches(params)` - Fetch match list

**Features**:
- List of matches with:
  - Title
  - Sport type
  - Date/time
  - Location
  - Participant count
  - Status badge
- "+ Create Match" button (future implementation)
- Empty state when no matches

**Navigation**:
- Tap match → Navigate to `/matches/[id]`

**Match Status Colors**:
- `scheduled` - Blue (#2196F3)
- `live` - Green (#4CAF50)
- `finished` - Grey (#9E9E9E)
- `cancelled` - Red (#F44336)

---

### 6. Match Detail Screen (`app/(main)/matches/[id].tsx`)

**Purpose**: View match details and take actions

**API Hooks**:
- `useGetMatchById(id)` - Fetch match details
- `useJoinMatch()` - Join match (planned)
- `useLeaveMatch()` - Leave match (planned)

**Displayed Data**:
- Match title and status
- Sport type
- Match type (friendly/competitive/tournament)
- Date and time
- Location
- Participant count
- Description

**Actions**:
- "Join Match" button
- "Share" button

**URL Pattern**: `/matches/[id]` where `[id]` is the match ID

---

### 7. Teams Screen (`app/(main)/teams.tsx`)

**Purpose**: Browse and manage teams

**Status**: Placeholder (implementation pending)

**Planned API Hooks**:
- `useGetTeams()`
- `useCreateTeam()`
- `useJoinTeam()`

---

### 8. Tournaments Screen (`app/(main)/tournaments.tsx`)

**Purpose**: Browse and join tournaments

**Status**: Placeholder (implementation pending)

**Planned API Hooks**:
- `useGetTournaments()`
- `useGetTournamentById()`
- `useJoinTournament()`

---

### 9. Profile Screen (`app/(main)/profile.tsx`)

**Purpose**: User profile and account management

**API Hooks**:
- `useAuth()` - Get user data
- `useLogout()` - Sign out

**Features**:
- Avatar (shows first letter of name)
- User name and email
- Account section:
  - Edit Profile
  - Stats & Achievements
  - Friends
- Settings section:
  - Notifications
  - Privacy
  - Help & Support
- Logout button

**Navigation**:
- Logout → Clear auth and redirect to home

---

## Tab Navigation Structure

The main app uses bottom tab navigation with 5 tabs:

| Tab | Icon | Screen | Badge |
|-----|------|--------|-------|
| Dashboard | 🏠 home | Dashboard | - |
| Matches | ⚽ football | Matches | - |
| Tournaments | 🏆 trophy | Tournaments | - |
| Teams | 👥 people | Teams | - |
| Profile | 👤 person | Profile | - |

---

## Protected Route Logic

All routes in `(main)` group check authentication:

```typescript
const { isAuthenticated, isLoading } = useAuth();

if (isLoading) return <LoadingScreen />;
if (!isAuthenticated) router.replace('/login');
```

---

## Deep Linking Patterns

The app supports deep linking for:

- `milokhelo://` - App scheme
- `/matches/[id]` - Direct match link
- `/tournaments/[id]` - Direct tournament link
- `/teams/[id]` - Direct team link
- `/profile` - User profile

---

## Future Screens (Planned)

Additional screens to be implemented:

### Matches
- `/matches/create` - Create new match
- `/matches/[id]/edit` - Edit match (organizer)

### Tournaments
- `/tournaments/` - List tournaments
- `/tournaments/[id]` - Tournament details
- `/tournaments/[id]/bracket` - View bracket
- `/tournaments/create` - Create tournament

### Teams
- `/teams/` - List teams
- `/teams/[id]` - Team details
- `/teams/create` - Create team

### Venues
- `/venues/` - Browse venues
- `/venues/[id]` - Venue details
- `/venues/search` - Search with map
- `/venues/nearby` - Nearby venues

### Chat
- `/chat/` - Chat rooms list
- `/chat/[roomId]` - Chat conversation

### Calendar
- `/calendar/` - Calendar view
- `/calendar/sync` - Google Calendar integration

### Notifications
- `/notifications/` - Notifications list

### Settings
- `/settings/` - App settings
- `/settings/profile` - Edit profile
- `/settings/notifications` - Notification preferences
- `/settings/privacy` - Privacy settings

---

## Navigation Utilities

### Router Methods
```typescript
import { useRouter } from 'expo-router';

router.push('/path');     // Navigate forward
router.replace('/path');  // Replace current route
router.back();           // Go back
router.canGoBack();      // Check if can go back
```

### Route Parameters
```typescript
import { useLocalSearchParams } from 'expo-router';

const { id } = useLocalSearchParams<{ id: string }>();
```

---

## Loading & Error States

All screens with API calls handle:
- **Loading**: Show `ActivityIndicator`
- **Error**: Show error message with retry option
- **Empty**: Show empty state with call-to-action

---

## Styling Guidelines

### Colors
- Primary: `#6200ee` (Purple)
- Success: `#4CAF50` (Green)
- Error: `#F44336` (Red)
- Warning: `#FF9800` (Orange)
- Info: `#2196F3` (Blue)
- Text: `#333` (Dark Grey)
- Subtitle: `#666` (Grey)
- Background: `#f5f5f5` (Light Grey)

### Typography
- Title: 24-28px, Bold
- Subtitle: 16-18px, Regular
- Body: 14-16px
- Caption: 12-14px

---

## Summary

✅ **Total Routes**: 10+ screens
✅ **Protected Routes**: 5 screens in (main) group
✅ **Public Routes**: 3 screens in (auth) group
✅ **Navigation Pattern**: File-based with Expo Router v3
✅ **Layout Types**: Stack, Tabs
✅ **Auth Flow**: Handled by AuthContext
✅ **Type Safety**: Full TypeScript + Zod validation
