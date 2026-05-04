import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { normalizeId } from '../utils/idUtils';

// Demo-only cart state lives in localStorage for the prototype and will later be backed by services.
const CartContext = createContext(null);
const STORAGE_KEY = 'shopora-cart-v1';

function readStoredCart() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function normalizeCartItem(item) {
  const productId = normalizeId(item?.productId ?? item?.id);
  const key = normalizeId(item?.key ?? `${productId}-${item?.size ?? 'One Size'}-${item?.color ?? 'Default'}`);

  return {
    ...item,
    key,
    productId,
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStoredCart().map(normalizeCartItem));

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, options = {}) => {
    if (Number(product.stockCount ?? 0) <= 0) {
      return false;
    }

    const size = options.size ?? product.sizes?.[0] ?? 'One Size';
    const color = options.color ?? product.colors?.[0] ?? 'Default';
    const quantity = options.quantity ?? 1;
    const unitPrice = product.salePrice ?? product.price;
    const productId = normalizeId(product.id);
    const key = `${productId}-${size}-${color}`;

    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }

      return [
        ...current,
        {
          key,
          productId,
          name: product.name,
          brand: product.brand ?? '',
          category: product.category,
          department: product.department,
          image: product.image,
          unitPrice,
          originalPrice: product.price,
          salePrice: product.salePrice ?? null,
          size,
          color,
          quantity,
        },
      ];
    });

    return true;
  };

  const addProduct = addItem;

  const increaseItem = (key) => {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, quantity: item.quantity + 1 } : item)),
    );
  };

  const decreaseItem = (key) => {
    setItems((current) =>
      current
        .map((item) => (item.key === key ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (key) => {
    setItems((current) => current.filter((item) => item.key !== key));
  };

  const clearCart = () => setItems([]);

  const count = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [items],
  );

  const value = {
    items,
    count,
    subtotal,
    addItem,
    addProduct,
    increaseItem,
    decreaseItem,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
