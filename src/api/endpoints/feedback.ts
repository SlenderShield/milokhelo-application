import { apiClient } from '../client';
import {
  Feedback,
  FeedbackSchema,
  FeedbackCreate,
} from '../models';

// Submit Feedback
export const submitFeedback = (data: FeedbackCreate) =>
  apiClient
    .post<Feedback>('/feedback', data)
    .then((res) => FeedbackSchema.parse(res.data));

// Get Feedback (Admin)
export const getFeedbackList = () =>
  apiClient
    .get<Feedback[]>('/feedback')
    .then((res) => FeedbackSchema.array().parse(res.data));
