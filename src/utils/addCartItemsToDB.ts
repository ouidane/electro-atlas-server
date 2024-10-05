import { Product, Cart, CartItem } from "../models";

// Add items to database when user registered
const addCartItemsToDatabase = async (
  cartItems: any[],
  userId: unknown
): Promise<void> => {
  const cart = await Cart.create({ userId });

  if (!cartItems || cartItems.length === 0) {
    return;
  }

  for (const item of cartItems) {
    const product = await Product.findById(item.productId);
    if (!product || item.quantity <= 0) {
      continue; // Skip this item and proceed to the next
    }

    await CartItem.create({
      quantity: item.quantity,
      productId: item.productId,
      cartId: cart._id,
    });
  }

  await Cart.updateCart(cart._id);
};

export { addCartItemsToDatabase };
