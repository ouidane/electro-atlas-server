import { FormattedItem, StockCheckResult } from "../@types/types";
declare function checkStock(formattedItems: FormattedItem[]): Promise<StockCheckResult>;
declare function updateInventory(orderId: unknown): Promise<void>;
declare function restoreInventory(orderId: unknown): Promise<void>;
export { checkStock, updateInventory, restoreInventory };
