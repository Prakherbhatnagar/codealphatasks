import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getNotifications = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Notifications fetched', { notifications: [], unreadCount: 0 }));
export const markNotificationRead = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Notification marked as read'));
export const markAllNotificationsRead = asyncHandler(async (req, res) => sendSuccess(res, 200, 'All notifications marked as read'));
