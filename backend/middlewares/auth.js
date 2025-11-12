import { static_path } from '../utils/helper.js';
import ErrorHandler from '../utils/handlerError.js';
import catchAsyncErrors from './catchAsyncErrors.js';
import jwt, { decode } from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

// Get the connection poo
// Check if user is authenticated or not
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  try {
    // Getting token from the cookie section which is built when user suers or logs in
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
      // res.status(201).json({ message: 'PDF TRIGGERDED successfully' });
      // return next(new ErrorHandler('Login first to access the resource', 401));
    }

    // Verify the token
    const decoded = jwt.verify(token, 'sd5fs4drw5er4sd5f1sd5f4s');

    // Get the user information according to the decoded id
    const avatarQuery = `SELECT * FROM users WHERE id = $1;`;
    // const result = await pool.query(avatarQuery, [decoded.id]);

    req.user = result.rows[0] || {
      email: decoded.email,
      code: decoded.code,
    }; // Store the decoded user information in the request object for future use

    next();
  } catch (error) {
    return next(new ErrorHandler(error, 401));
  }
});

// Handling user roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role ${req.user.role} is not allowed to access this resource`,
          403,
        ),
      );
    }
    next();
  };
};

// Get the academic information
export const academicInfo = catchAsyncErrors(async (req, res, next) => {
  try {
    // get the user information
    const static_folder = path.join(static_path, 'uploads');
    const configFilePath = path.resolve(static_folder, 'config_tm.json');
    const configData = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

    req.academy = configData.user_info;
    next();
  } catch (error) {
    return next(new ErrorHandler('Unauthorized access', 401));
  }
});
