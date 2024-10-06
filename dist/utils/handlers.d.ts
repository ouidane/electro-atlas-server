import { FormattedItem, StockCheckResult } from "../@types/types";
declare function checkStock(formattedItems: FormattedItem[]): Promise<StockCheckResult>;
declare function updateInventory(orderId: any): Promise<void>;
declare function restoreInventory(orderId: any): Promise<void>;
export { checkStock, updateInventory, restoreInventory, };
