import { Product, Wishlist } from "../models";

// Add items to database when user registered
const addWishlistItemsToDatabase = async (
  items: any[],
  userId: unknown
): Promise<void> => {
  const wishlist = await Wishlist.create({ userId });

  if (!items || items.length === 0) {
    return;
  }

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      continue; // Skip this item and proceed to the next
    }
    const variant = product.variants.find((v) => v.sku === item.sku);
    if (!variant) {
      continue;
    }

    wishlist.items.push(item);
  }

  await wishlist.save();
};

export { addWishlistItemsToDatabase };
