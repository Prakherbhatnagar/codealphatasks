import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getConversations = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Conversations fetched', []));
export const sendMessage = asyncHandler(async (req, res) => sendSuccess(res, 201, 'Message sent'));
export const getMessagesByConversation = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Messages history fetched', []));
