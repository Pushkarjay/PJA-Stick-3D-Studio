const { db } = require('../services/firebase.service');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get user cart
 */
exports.getCart = async (req, res, next) => {
  try {
    const { uid } = req.user;

    const cartDoc = await db.collection('cart').doc(uid).get();

    if (!cartDoc.exists) {
      return res.json({
        success: true,
        data: { items: [], total: 0 }
      });
    }

    const cartData = cartDoc.data();
    
    // Get product details for each cart item
    const items = await Promise.all(
      cartData.items.map(async (item) => {
        const productDoc = await db.collection('products').doc(item.productId).get();
        if (productDoc.exists) {
          const productData = productDoc.data();
          return {
            ...item,
            product: {
              id: productDoc.id,
              name: productData.name,
              price: productData.price,
              images: productData.images
            },
            subtotal: productData.price * item.quantity
          };
        }
        return null;
      })
    );

    const validItems = items.filter(item => item !== null);
    const total = validItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({
      success: true,
      data: {
        items: validItems,
        total,
        itemCount: validItems.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 */
exports.addToCart = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { productId, quantity = 1 } = req.body;

    // Verify product exists
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    const cartRef = db.collection('cart').doc(uid);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      // Create new cart
      await cartRef.set({
        userId: uid,
        items: [{
          productId,
          quantity,
          addedAt: new Date()
        }],
        updatedAt: new Date()
      });
    } else {
      // Update existing cart
      const cartData = cartDoc.data();
      const existingItemIndex = cartData.items.findIndex(item => item.productId === productId);

      if (existingItemIndex >= 0) {
        // Update quantity
        cartData.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cartData.items.push({
          productId,
          quantity,
          addedAt: new Date()
        });
      }

      await cartRef.update({
        items: cartData.items,
        updatedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Item added to cart'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update cart item quantity
 */
exports.updateCartItem = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      throw new AppError('Quantity must be at least 1', 400, 'INVALID_QUANTITY');
    }

    const cartRef = db.collection('cart').doc(uid);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');
    }

    const cartData = cartDoc.data();
    const itemIndex = cartData.items.findIndex(item => item.productId === itemId);

    if (itemIndex === -1) {
      throw new AppError('Item not found in cart', 404, 'ITEM_NOT_FOUND');
    }

    cartData.items[itemIndex].quantity = quantity;

    await cartRef.update({
      items: cartData.items,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Cart updated'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 */
exports.removeFromCart = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { itemId } = req.params;

    const cartRef = db.collection('cart').doc(uid);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');
    }

    const cartData = cartDoc.data();
    const updatedItems = cartData.items.filter(item => item.productId !== itemId);

    await cartRef.update({
      items: updatedItems,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 */
exports.clearCart = async (req, res, next) => {
  try {
    const { uid } = req.user;

    await db.collection('cart').doc(uid).delete();

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
};
