class ApiError extends Error {
    constructor(statusCode, message = "something went wrong",
        errors = [], stack = ""
    ) {
        // Call parent Error class constructor
        super();
        // HTTP status code for the error (e.g. 400, 404, 500)
        this.statusCode = statusCode;

        // Additional data payload, initialized as null
        this.data = null;
         // Custom error message
         this.message = message;
        this.sucssess = false;
        this.errors=errors;
        if(stack){
            this.stack=stack;
        }else{
            Error.captureStackTrace(this,this.constructor);
        }
    }
} 
export { ApiError };