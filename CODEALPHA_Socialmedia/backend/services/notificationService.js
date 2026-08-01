import Notification from '../models/Notification.js';

export const createNotification = async ({ sender, receiver, type, message, post = null }) => {
  if (sender.toString() === receiver.toString()) return null;
  return await Notification.create({ sender, receiver, type, message, post });
};
