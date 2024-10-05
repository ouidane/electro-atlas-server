import CustomAPIError from "./custom-api";

class ValidationError extends CustomAPIError {
  errors: { [key: string]: string };

  constructor(message: string, errors: { [key: string]: string }) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export default ValidationError;
