import { UnavailableItem } from "../@types/types";
import CustomAPIError from "./custom-api";

class StockUnavailableError extends CustomAPIError {
  errors: UnavailableItem[];

  constructor(message: string, unavailableItems: UnavailableItem[]) {
    super(message);
    this.name = "StockUnavailableError";
    this.errors = unavailableItems;
  }
}

export default StockUnavailableError;
