import { FormattedItem, StockCheckResult } from "../@types/types";
import { Product, OrderItem } from "../models";
import debug from "debug";

const debugLogStripe = debug("myapp:Stripe");

async function checkStock(
  formattedItems: FormattedItem[]
): Promise<StockCheckResult> {
  const productIds = formattedItems.map((item) => item.productId);

  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));
  const unavailableItems: StockCheckResult["unavailableItems"] = [];

  for (const item of formattedItems) {
    const product = productMap.get(item.productId.toString());

    if (!product) {
      unavailableItems.push({
        productId: product._id.toString(),
        sku: item.variant.sku,
        reason: "Product not found",
      });
      continue;
    }

    const matchingVariant = product.variants.find(
      (v) => v.sku === item.variant.sku
    );

    if (!matchingVariant) {
      unavailableItems.push({
        productId: product._id.toString(),
        sku: item.variant.sku,
        reason: "Matching variant not found",
      });
    } else if (matchingVariant.inventory < item.quantity) {
      unavailableItems.push({
        productId: product._id.toString(),
        sku: item.variant.sku,
        reason: `Insufficient stock (requested: ${item.quantity}, available: ${matchingVariant.inventory})`,
      });
    }
  }

  return {
    isAvailable: unavailableItems.length === 0,
    unavailableItems,
  };
}

async function updateInventory(orderId) {
  const orderItems = await OrderItem.find({ orderId });
  for (const item of orderItems) {
    await Product.findOneAndUpdate(
      { _id: item.productId, "variants.sku": item.sku },
      { $inc: { "variants.$.inventory": -item.quantity }}
    );
  }
}

async function restoreInventory(orderId) {
  const orderItems = await OrderItem.find({ orderId });
  for (const item of orderItems) {
    await Product.findOneAndUpdate(
      { _id: item.productId, "variants.sku": item.sku },
      { $inc: { "variants.$.inventory": item.quantity }}
    );
  }
}


export {
  checkStock,
  updateInventory,
  restoreInventory,
};
