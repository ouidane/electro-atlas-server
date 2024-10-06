import CustomAPIError from "./custom-api";
declare class ValidationError extends CustomAPIError {
    errors: {
        [key: string]: string;
    };
    constructor(message: string, errors: {
        [key: string]: string;
    });
}
export default ValidationError;
