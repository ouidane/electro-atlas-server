import CustomAPIError from "./custom-api";

class ValidationError extends CustomAPIError {
  errors;

  constructor(message: string, errors?: any) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export default ValidationError;
