
const errorHandler = (err, req, res, next) => {

let statusCode = err.statusCode || 500
let message = err.message || 'Internal Server Error'

//Mongoose bad ObjectId
if (err.name === 'CastError') {
    statusCode = 400
    message = `Resource not found with id of ${err.value}`
}

//Mongoose duplicate key
if (err.code === 11000) {
    statusCode = 400
    message = 'Duplicate field value entered'   
}

//mullter size limit error
if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400
    message = 'File size is too large'
}

//Jwt error
if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
}

//Jwt expired error
if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
}

console.log( "Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
}) 

res.status(statusCode).json({
    success: false,
    error: message,
    statusCode: statusCode,
    ... (process.env.NODE_ENV === 'development' && { stack: err.stack })
})

} 



export default errorHandler