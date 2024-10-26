import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return next(createError(401, "You are not authenticated!"));
  }

  jwt.verify(token, process.env.JWT, (err, user) => {
    if (err) return next(createError(403, "Token is not valid!"));
    req.user = user;
    next();
  });
};

export const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
      if (req.user.id === req.params.id || req.user.isAdmin) {
        next();
      } else {
        return next(createError(403, "You are not authorized!"));
      }
    });
  };

  export const verifyAdmin = (req, res, next) => {
    // First, verify the token
    verifyToken(req, res, (err) => {
      // Handle token verification errors
      if (err) {
        return next(err); // Pass the error to the error handler
      }
      
      // After successful token verification, check if the user is an admin
      if (req.user.isAdmin) {
        next(); // Proceed if the user is an admin
      } else {
        return next(createError(403, "You are not authorized!")); // If not an admin, send 403 error
      }
    });
  };
  