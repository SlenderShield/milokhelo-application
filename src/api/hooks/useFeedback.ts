import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as feedbackApi from '../endpoints/feedback';
import { FeedbackCreate } from '../models';

// Query Keys
export const feedbackKeys = {
  all: ['feedback'] as const,
  lists: () => [...feedbackKeys.all, 'list'] as const,
};

// ===== QUERIES =====

// Get Feedback List (Admin Only)
export const useGetFeedbackList = () =>
  useQuery({
    queryKey: feedbackKeys.lists(),
    queryFn: () => feedbackApi.getFeedbackList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

// ===== MUTATIONS =====

// Submit Feedback
export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FeedbackCreate) => feedbackApi.submitFeedback(data),
    onSuccess: () => {
      // Invalidate feedback list (if admin is viewing)
      queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
    },
  });
};
