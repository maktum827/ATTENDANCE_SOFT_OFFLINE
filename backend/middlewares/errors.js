import ErrorHandler from "../utils/handlerError.js";

// Middleware to handle errors
const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500; // Default error code 500 if none is provided

    // Specify error for development mode 
    if (process.env.NODE_ENV === 'DEVELOPMENT') {
        return res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        });
    }

    // Specify error for production mode
    if (process.env.NODE_ENV === 'PRODUCTION') {
        let error = { ...err }; // Copy the error

        error.message = err.message;

        // Wrong Mongoose Object ID Error 
        if (err.name === 'CastError') {
            const message = `Resource not found. Invalid: ${err.path}`;
            error = new ErrorHandler(message, 400);
        }

        // Handling wrong JWT error
        if (err.name === 'JsonWebTokenError') {
            const message = 'JSON Web Token is invalid. Try Again!!!';
            error = new ErrorHandler(message, 400);
        }

        // Handling Expired JWT error
        if (err.name === 'TokenExpiredError') {
            const message = 'JSON Web Token is expired. Try Again!!!';
            error = new ErrorHandler(message, 400);
        }

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};

export default errorMiddleware;
