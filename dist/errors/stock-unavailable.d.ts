import { UnavailableItem } from "../@types/types";
import CustomAPIError from "./custom-api";
declare class StockUnavailableError extends CustomAPIError {
    errors: UnavailableItem[];
    constructor(message: string, unavailableItems: UnavailableItem[]);
}
export default StockUnavailableError;
