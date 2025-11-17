import { Request } from 'express';
import { ActivityLog } from '../models';
import mongoose from 'mongoose';

/**
 * Extract IP address from request, considering proxies and load balancers
 */
export const getClientIp = (req: Request): string => {
  // Check various headers that might contain the real IP
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
    return ips[0].trim();
  }
  
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return realIp.trim();
  }
  
  return req.ip || req.socket.remoteAddress || 'Unknown';
};

/**
 * Log user activity with IP address and device information
 */
export const logActivity = async (params: {
  userId: mongoose.Types.ObjectId | string;
  action: string;
  details: string;
  req: Request;
  success?: boolean;
  deviceId?: string;
  browser?: string;
  os?: string;
}) => {
  try {
    const { userId, action, details, req, success = true, deviceId, browser, os } = params;
    
    await ActivityLog.create({
      userId,
      action,
      details,
      ipAddress: getClientIp(req),
      browser,
      os,
      deviceId,
      success,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
