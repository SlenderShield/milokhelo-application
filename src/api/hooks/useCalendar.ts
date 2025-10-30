import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as calendarApi from '../endpoints/calendar';
import { EventCreate, EventSync } from '../models';

// Query Keys
export const calendarKeys = {
  all: ['calendar'] as const,
  events: () => [...calendarKeys.all, 'events'] as const,
  googleAuth: () => [...calendarKeys.all, 'google', 'auth'] as const,
};

// ===== QUERIES =====

// Get Calendar Events
export const useGetCalendarEvents = () =>
  useQuery({
    queryKey: calendarKeys.events(),
    queryFn: () => calendarApi.getCalendarEvents(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

// Get Google Calendar Auth URL
export const useGetGoogleCalendarAuthUrl = () =>
  useQuery({
    queryKey: calendarKeys.googleAuth(),
    queryFn: () => calendarApi.getGoogleCalendarAuthUrl(),
    staleTime: 10 * 60 * 1000, // 10 minutes (URL doesn't change often)
    enabled: false, // Only fetch when explicitly needed
  });

// ===== MUTATIONS =====

// Create Calendar Event
export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EventCreate) => calendarApi.createCalendarEvent(data),
    onSuccess: () => {
      // Invalidate events list to refetch
      queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
    },
  });
};

// Sync Calendar Events (from device)
export const useSyncCalendarEvents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (events: EventSync[]) => calendarApi.syncCalendarEvents(events),
    onSuccess: () => {
      // Invalidate events list to refetch
      queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
    },
  });
};

// Sync with Google Calendar
export const useSyncWithGoogleCalendar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => calendarApi.syncWithGoogleCalendar(),
    onSuccess: () => {
      // Invalidate events list to refetch with newly imported events
      queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
    },
  });
};

// Disconnect Google Calendar
export const useDisconnectGoogleCalendar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => calendarApi.disconnectGoogleCalendar(),
    onSuccess: () => {
      // Invalidate auth URL in case it needs to be regenerated
      queryClient.invalidateQueries({ queryKey: calendarKeys.googleAuth() });
      // Optionally invalidate events list
      queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
    },
  });
};
