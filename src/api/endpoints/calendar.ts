import { apiClient } from '../client';
import { Event, EventSchema, EventCreate, EventSync } from '../models';

// Get Calendar Events
export const getCalendarEvents = () =>
  apiClient.get<Event[]>('/calendar/events').then(res => EventSchema.array().parse(res.data));

// Create Calendar Event
export const createCalendarEvent = (data: EventCreate) =>
  apiClient.post<Event>('/calendar/events', data).then(res => EventSchema.parse(res.data));

// Sync Calendar Events
export const syncCalendarEvents = (events: EventSync[]) =>
  apiClient
    .post<{ synced: number; conflicts: any[] }>('/calendar/sync', { events })
    .then(res => res.data);

// Get Google Calendar Auth URL
export const getGoogleCalendarAuthUrl = () =>
  apiClient.get<{ authUrl: string }>('/calendar/google/auth').then(res => res.data);

// Google Calendar Callback (handled by backend redirect)
// No client function needed - OAuth flow redirects

// Sync with Google Calendar
export const syncWithGoogleCalendar = () =>
  apiClient.post<{ imported: number; events: Event[] }>('/calendar/google/sync').then(res => ({
    imported: res.data.imported,
    events: EventSchema.array().parse(res.data.events),
  }));

// Disconnect Google Calendar
export const disconnectGoogleCalendar = () =>
  apiClient.delete<{ message: string }>('/calendar/google/disconnect').then(res => res.data);
