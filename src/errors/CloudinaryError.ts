import CustomAPIError from "./custom-api";

class ValidationError extends CustomAPIError {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "CloudinaryError";
  }
}

export default ValidationError;
