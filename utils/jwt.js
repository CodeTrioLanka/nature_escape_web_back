import jwt from 'jsonwebtoken';
import { application } from '../config/application.js';

export const signAccessToken = (payload) => {
  return jwt.sign(payload, application.JWT_SECRET, { expiresIn: '15m' });
};

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, application.JWT_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, application.JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, application.JWT_SECRET);
};
