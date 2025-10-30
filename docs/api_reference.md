# MiloKhelo API Reference

Auto-generated from OpenAPI specification.

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Teams](#teams)
- [Matches](#matches)
- [Tournaments](#tournaments)
- [Venues](#venues)
- [Chat](#chat)
- [Calendar](#calendar)
- [Notifications & Invitations](#notifications--invitations)
- [Maps](#maps)
- [Feedback](#feedback)
- [Admin](#admin)

---

## Authentication

### Endpoints

#### `GET /auth/providers`
- **Hook**: `useGetOAuthProviders()`
- **Description**: List supported OAuth providers (Google, Facebook)
- **Response**: Array of OAuth providers

#### `POST /auth/register`
- **Hook**: `useRegister()`
- **Description**: Register with email/password
- **Body**: `{ name, email, password }`
- **Response**: User profile

#### `POST /auth/login`
- **Hook**: `useLogin()`
- **Description**: Login with email/password
- **Body**: `{ email, password }`
- **Response**: User profile + session cookie

#### `GET /auth/me`
- **Hook**: `useGetCurrentUser()`
- **Description**: Get authenticated user profile
- **Auth**: Required
- **Response**: User profile

#### `GET /auth/session`
- **Hook**: `useValidateSession()`
- **Description**: Validate/refresh session
- **Auth**: Required
- **Response**: User profile

#### `POST /auth/logout`
- **Hook**: `useLogout()`
- **Description**: Logout and clear session
- **Auth**: Required

#### `POST /auth/verify-email/{token}`
- **Hook**: `useVerifyEmail()`
- **Description**: Verify email with token

#### `POST /auth/forgot-password`
- **Hook**: `useForgotPassword()`
- **Description**: Request password reset
- **Body**: `{ email }`

#### `POST /auth/reset-password/{token}`
- **Hook**: `useResetPassword()`
- **Description**: Reset password with token
- **Body**: `{ password, confirmPassword }`

#### `PUT /auth/change-password`
- **Hook**: `useChangePassword()`
- **Description**: Change password for authenticated user
- **Auth**: Required
- **Body**: `{ currentPassword, newPassword, confirmPassword }`

#### `DELETE /auth/deactivate`
- **Hook**: `useDeactivateAccount()`
- **Description**: Deactivate user account
- **Auth**: Required

---

## Users

### Endpoints

#### `GET /users/me`
- **Hook**: `useGetMyProfile()`
- **Description**: Get current user profile
- **Auth**: Required
- **Response**: User profile

#### `PUT /users/me`
- **Hook**: `useUpdateMyProfile()`
- **Description**: Update current user profile
- **Auth**: Required
- **Body**: UserUpdate object
- **Response**: Updated user profile

#### `GET /users/search`
- **Hook**: `useSearchUsers(params)`
- **Description**: Search users by query
- **Query**: `q, query, sport, limit, skip`
- **Response**: Array of users

#### `GET /users/{id}/stats`
- **Hook**: `useGetUserStats(id)`
- **Description**: Get user statistics by sport
- **Response**: Array of UserStat objects

#### `GET /users/me/achievements`
- **Hook**: `useGetMyAchievements()`
- **Description**: Get current user's achievements
- **Auth**: Required
- **Response**: Array of achievements

#### `GET /users/{id}/achievements`
- **Hook**: `useGetUserAchievements(id)`
- **Description**: Get user's achievements
- **Response**: Array of achievements

#### `GET /users/{id}/friends`
- **Hook**: `useGetUserFriends(id)`
- **Description**: Get user's friends list
- **Response**: Array of user profiles

#### `POST /users/{friendId}/friend`
- **Hook**: `useAddFriend()`
- **Description**: Add friend
- **Auth**: Required

#### `DELETE /users/{friendId}/friend`
- **Hook**: `useRemoveFriend()`
- **Description**: Remove friend
- **Auth**: Required

---

## Teams

### Endpoints

#### `POST /teams`
- **Hook**: `useCreateTeam()`
- **Description**: Create a new team
- **Auth**: Required
- **Body**: TeamCreate object
- **Response**: Created team

#### `GET /teams`
- **Hook**: `useGetTeams(params)`
- **Description**: List/search teams
- **Query**: `sport, q`
- **Response**: Array of teams

#### `GET /teams/{id}`
- **Hook**: `useGetTeamById(id)`
- **Description**: Get team details
- **Response**: Team object

#### `PUT /teams/{id}`
- **Hook**: `useUpdateTeam(id, data)`
- **Description**: Update team (captain/admin only)
- **Auth**: Required
- **Body**: TeamUpdate object
- **Response**: Updated team

#### `DELETE /teams/{id}`
- **Hook**: `useDeleteTeam(id)`
- **Description**: Delete team (captain/admin only)
- **Auth**: Required

#### `POST /teams/{id}/join`
- **Hook**: `useJoinTeam(id, data)`
- **Description**: Join a team
- **Auth**: Required
- **Body**: `{ joinCode }` (optional)

#### `POST /teams/{id}/leave`
- **Hook**: `useLeaveTeam(id)`
- **Description**: Leave a team
- **Auth**: Required

---

## Matches

### Endpoints

#### `POST /matches`
- **Hook**: `useCreateMatch()`
- **Description**: Create a match
- **Auth**: Required
- **Body**: MatchCreate object
- **Response**: Created match

#### `GET /matches`
- **Hook**: `useGetMatches(params)`
- **Description**: List/search matches
- **Query**: `sport, city, startAt`
- **Response**: Array of matches

#### `GET /matches/{id}`
- **Hook**: `useGetMatchById(id)`
- **Description**: Get match details
- **Response**: Match object

#### `PATCH /matches/{id}`
- **Hook**: `useUpdateMatch(id, data)`
- **Description**: Update match
- **Auth**: Required (organizer)
- **Body**: MatchUpdate object
- **Response**: Updated match

#### `DELETE /matches/{id}`
- **Hook**: `useDeleteMatch(id)`
- **Description**: Cancel match (organizer only)
- **Auth**: Required

#### `POST /matches/{id}/join`
- **Hook**: `useJoinMatch(id)`
- **Description**: Join a match
- **Auth**: Required

#### `POST /matches/{id}/leave`
- **Hook**: `useLeaveMatch(id)`
- **Description**: Leave a match
- **Auth**: Required

#### `PUT /matches/{id}/score`
- **Hook**: `useUpdateMatchScore(id, data)`
- **Description**: Update match score
- **Auth**: Required (organizer/participants)
- **Body**: MatchResult object

#### `PUT /matches/{id}/status`
- **Hook**: `useUpdateMatchStatus(id, data)`
- **Description**: Update match status
- **Auth**: Required (organizer)
- **Body**: `{ status }`

#### `POST /matches/{id}/finish` (Legacy)
- **Hook**: `useFinishMatch(id, data)`
- **Description**: Finish match and update stats
- **Auth**: Required
- **Body**: MatchResult object
- **Note**: Automatically triggers stat updates via events

---

## Tournaments

### Endpoints

#### `POST /tournaments`
- **Hook**: `useCreateTournament()`
- **Description**: Create tournament
- **Auth**: Required
- **Body**: TournamentCreate object
- **Response**: Created tournament

#### `GET /tournaments`
- **Hook**: `useGetTournaments(params)`
- **Description**: List/search tournaments
- **Query**: `sport, type`
- **Response**: Array of tournaments

#### `GET /tournaments/{id}`
- **Hook**: `useGetTournamentById(id)`
- **Description**: Get tournament details
- **Response**: Tournament object

#### `PUT /tournaments/{id}`
- **Hook**: `useUpdateTournament(id, data)`
- **Description**: Update tournament
- **Auth**: Required (organizer/admin)
- **Body**: TournamentUpdate object

#### `DELETE /tournaments/{id}`
- **Hook**: `useDeleteTournament(id)`
- **Description**: Cancel tournament
- **Auth**: Required (organizer/admin)

#### `POST /tournaments/{id}/join`
- **Hook**: `useJoinTournament(id, data)`
- **Description**: Register team for tournament
- **Auth**: Required
- **Body**: `{ teamId }`

#### `POST /tournaments/{id}/leave`
- **Hook**: `useLeaveTournament(id, data)`
- **Description**: Remove team from tournament
- **Auth**: Required
- **Body**: `{ teamId }`

#### `PUT /tournaments/{id}/start`
- **Hook**: `useStartTournament(id)`
- **Description**: Start tournament and generate bracket
- **Auth**: Required (organizer)

#### `GET /tournaments/{id}/bracket`
- **Hook**: `useGetTournamentBracket(id)`
- **Description**: Get tournament bracket
- **Response**: Bracket object (knockout or league)

#### `POST /tournaments/{id}/match-result`
- **Hook**: `useUpdateTournamentMatchResult(id, data)`
- **Description**: Update match result in tournament
- **Auth**: Required
- **Body**: `{ matchNumber, result }`

---

## Venues

### Public Endpoints

#### `GET /venues`
- **Hook**: `useGetVenues(params)`
- **Description**: List approved venues
- **Query**: `page, limit`

#### `GET /venues/search`
- **Hook**: `useSearchVenues(params)`
- **Description**: Search venues
- **Query**: `q, city, sport`

#### `GET /venues/nearby`
- **Hook**: `useGetNearbyVenues(params)`
- **Description**: Find nearby venues
- **Query**: `lat, lng, radius, sport, available`

#### `GET /venues/{venueId}`
- **Hook**: `useGetVenueById(venueId)`
- **Description**: Get venue details

#### `GET /venues/{venueId}/availability`
- **Hook**: `useGetVenueAvailability(venueId, date)`
- **Description**: Check venue slot availability
- **Query**: `date`

#### `POST /venues/{venueId}/book`
- **Hook**: `useBookVenueSlot(venueId, data)`
- **Description**: Book venue slot
- **Auth**: Required
- **Body**: BookingCreate object

### Venue Management (Owner)

#### `GET /venue-management/venues`
- **Hook**: `useGetMyVenues()`
- **Description**: List owned venues
- **Auth**: Required (venue_owner role)

#### `POST /venue-management/venues`
- **Hook**: `useCreateVenue()`
- **Description**: Create venue
- **Auth**: Required (venue_owner role)
- **Body**: VenueCreate object

#### `PATCH /venue-management/venues/{venueId}`
- **Hook**: `useUpdateVenue(venueId, data)`
- **Description**: Update venue
- **Auth**: Required (owner)
- **Body**: VenueUpdate object

#### `DELETE /venue-management/venues/{venueId}`
- **Hook**: `useDeleteVenue(venueId)`
- **Description**: Delete venue
- **Auth**: Required (owner)

#### `POST /venue-management/bookings/{bookingId}/approve`
- **Hook**: `useApproveBooking(bookingId)`
- **Description**: Approve booking
- **Auth**: Required (owner)

#### `POST /venue-management/bookings/{bookingId}/reject`
- **Hook**: `useRejectBooking(bookingId, reason)`
- **Description**: Reject booking
- **Auth**: Required (owner)

---

## Chat

#### `GET /chat/rooms`
- **Hook**: `useGetChatRooms()`
- **Description**: List user's chat rooms
- **Auth**: Required

#### `POST /chat/rooms`
- **Hook**: `useCreateChatRoom()`
- **Description**: Create chat room
- **Auth**: Required

#### `GET /chat/rooms/{roomId}/messages`
- **Hook**: `useGetChatMessages(roomId, params)`
- **Description**: Fetch messages
- **Auth**: Required
- **Query**: `limit, before`

#### `POST /chat/rooms/{roomId}/messages`
- **Hook**: `useSendChatMessage(roomId, data)`
- **Description**: Send message
- **Auth**: Required

---

## Calendar

#### `GET /calendar/events`
- **Hook**: `useGetCalendarEvents()`
- **Description**: Fetch backend events
- **Auth**: Required

#### `POST /calendar/events`
- **Hook**: `useCreateCalendarEvent()`
- **Description**: Create event
- **Auth**: Required

#### `POST /calendar/sync`
- **Hook**: `useSyncCalendarEvents()`
- **Description**: Sync device events
- **Auth**: Required

#### `GET /calendar/google/auth`
- **Hook**: `useGetGoogleCalendarAuthUrl()`
- **Description**: Get Google OAuth URL
- **Auth**: Required

#### `POST /calendar/google/sync`
- **Hook**: `useSyncWithGoogleCalendar()`
- **Description**: Import Google Calendar events
- **Auth**: Required

#### `DELETE /calendar/google/disconnect`
- **Hook**: `useDisconnectGoogleCalendar()`
- **Description**: Disconnect Google Calendar
- **Auth**: Required

---

## Notifications & Invitations

### Notifications

#### `GET /notifications`
- **Hook**: `useGetNotifications(params)`
- **Description**: List notifications
- **Auth**: Required

#### `PUT /notifications/{id}/read`
- **Hook**: `useMarkNotificationAsRead(id)`
- **Description**: Mark as read
- **Auth**: Required

#### `PATCH /notifications/read-all`
- **Hook**: `useMarkAllNotificationsAsRead()`
- **Description**: Mark all as read
- **Auth**: Required

#### `GET /notifications/unread/count`
- **Hook**: `useGetUnreadNotificationsCount()`
- **Description**: Get unread count
- **Auth**: Required

#### `POST /notifications/push-token`
- **Hook**: `useRegisterPushToken()`
- **Description**: Register device for push notifications
- **Auth**: Required

### Invitations

#### `POST /invitations`
- **Hook**: `useSendInvitation()`
- **Description**: Send invitation
- **Auth**: Required

#### `GET /invitations`
- **Hook**: `useGetInvitations()`
- **Description**: List invitations
- **Auth**: Required

#### `POST /invitations/{id}/respond`
- **Hook**: `useRespondToInvitation(id, data)`
- **Description**: Accept/decline invitation
- **Auth**: Required
- **Body**: `{ response: 'accept' | 'decline' }`

---

## Maps

#### `GET /maps/nearby`
- **Hook**: `useGetNearbyVenuePins()`
- **Description**: Get venue pins for map
- **Query**: `lat, lng, radius`

#### `POST /maps/submit`
- **Hook**: `useSubmitMapLocation()`
- **Description**: Submit location for match/tournament
- **Auth**: Required

---

## Feedback

#### `POST /feedback`
- **Hook**: `useSubmitFeedback()`
- **Description**: Submit feedback or report
- **Auth**: Required

#### `GET /feedback` (Admin)
- **Hook**: `useGetFeedbackList()`
- **Description**: List all feedback
- **Auth**: Required (admin)

---

## Admin

#### `GET /admin/reports` (Admin Only)
- **Hook**: `useGetAdminReports()`
- **Description**: List system reports
- **Auth**: Required (admin role)

---

## Authentication & Authorization

### Session-Based Auth
- All authenticated endpoints require session cookie
- Cookie automatically set on login/register
- Use `cookieAuth` security scheme

### Role-Based Access Control (RBAC)
- **Roles**: guest (0), user (1), venue_owner (2), moderator (3), admin (4), superadmin (5)
- Higher role levels inherit lower level permissions
- Some endpoints require specific roles (e.g., venue management, admin)

---

## Type Safety & Validation

All API responses are validated at runtime using Zod schemas:
- Automatic parsing and type checking
- Runtime validation ensures data integrity
- TypeScript types inferred from Zod schemas

---

## Error Handling

All endpoints may return errors in standard format:
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    }
  ]
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error
