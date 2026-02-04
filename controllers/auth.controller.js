import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { signAccessToken, signRefreshToken, verifyAccessToken } from '../utils/jwt.js';
import { loginSchema, registerSchema, changePasswordSchema } from '../validators/auth.schema.js';
import { logAction } from '../utils/logger.js';

export const register = async (req, res) => {
  try {
    const { email, password, role } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      role
    });

    const payload = { sub: user._id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Log the action (for admin/superadmin registrations)
    const userForLogging = {
      sub: user._id,
      role: user.role,
      email: user.email,
      username: user.email
    };
    await logAction(userForLogging, "REGISTER_USER", {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = { sub: user._id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Log the action (for admin/superadmin logins)
    const userForLogging = {
      sub: user._id,
      role: user.role,
      email: user.email,
      username: user.username || user.email
    };
    await logAction(userForLogging, "USER_LOGIN", {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Logged in',
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};

export const me = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.json({ user: null });
    }

    const payload = verifyAccessToken(token);

    // Fetch user details from database to get email and username
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.json({ user: null });
    }

    res.json({
      user: {
        id: user._id,
        sub: user._id, // Include sub for compatibility with logAction
        email: user.email,
        username: user.username || user.email, // Fallback to email if no username
        role: user.role
      }
    });
  } catch (error) {
    res.json({ user: null });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user.sub || req.user.id; // Support both sub (jwt) and id properties

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    // Log the action
    if (req.user) {
      await logAction(req.user, "CHANGE_PASSWORD", {
        userId: user._id,
        email: user.email
      });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    // Verify refresh token
    const { verifyRefreshToken } = await import('../utils/jwt.js');
    const payload = verifyRefreshToken(refreshToken);

    // Check if user still exists
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new access token
    const newPayload = { sub: user._id, role: user.role };
    const newAccessToken = signAccessToken(newPayload);

    // Set new access token cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({
      message: 'Token refreshed successfully',
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};
