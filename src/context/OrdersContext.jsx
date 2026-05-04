import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import {
  createSupabaseOrder,
  getSupabaseOrderById,
  getSupabaseOrderByStripeCheckoutSessionId,
  getSupabaseOrders,
} from '../services/supabaseOrdersService';
import { normalizeOrderItems } from '../utils/orderItemUtils';
import { idsMatch, normalizeId } from '../utils/idUtils';

const OrdersContext = createContext(null);
const STORAGE_KEY = 'shopora_orders';
const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const VALID_PAYMENT_STATUSES = ['Demo', 'Demo Paid', 'Demo Pending', 'Pending', 'Processing', 'Paid', 'Failed', 'Expired', 'Refunded'];

function readStoredOrders() {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredOrders(orders) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function pad(value, length) {
  return String(value).padStart(length, '0');
}

function toIsoDate(input) {
  const date = input ? new Date(input) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function formatOrderNumber(date = new Date()) {
  const stamp = [date.getFullYear(), pad(date.getMonth() + 1, 2), pad(date.getDate(), 2)].join('');
  const suffix = pad(Math.floor(Math.random() * 10000), 4);
  return `SO-${stamp}-${suffix}`;
}

function normalizeStatus(status) {
  const cleanStatus = typeof status === 'string' ? status.trim() : '';
  return VALID_STATUSES.includes(cleanStatus) ? cleanStatus : 'Pending';
}

function normalizePaymentStatus(status) {
  const cleanStatus = typeof status === 'string' ? status.trim() : '';
  return VALID_PAYMENT_STATUSES.includes(cleanStatus) ? cleanStatus : 'Demo Paid';
}

function normalizePaymentProvider(provider) {
  const cleanProvider = typeof provider === 'string' ? provider.trim() : '';
  if (!cleanProvider) return 'Demo';
  if (cleanProvider.toLowerCase() === 'stripe') return 'Stripe';
  return cleanProvider === 'Demo' ? 'Demo' : 'Demo';
}

function normalizeCurrency(currency) {
  const cleanCurrency = typeof currency === 'string' ? currency.trim() : '';
  return cleanCurrency ? cleanCurrency.toUpperCase() : 'USD';
}

function normalizePaidAt(value) {
  if (value == null || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeShippingAddress(address) {
  const safeAddress = address && typeof address === 'object' && !Array.isArray(address) ? address : {};

  return {
    firstName: typeof safeAddress.firstName === 'string' ? safeAddress.firstName : '',
    lastName: typeof safeAddress.lastName === 'string' ? safeAddress.lastName : '',
    street: typeof safeAddress.street === 'string' ? safeAddress.street : '',
    city: typeof safeAddress.city === 'string' ? safeAddress.city : '',
    state: typeof safeAddress.state === 'string' ? safeAddress.state : '',
    zip: typeof safeAddress.zip === 'string' ? safeAddress.zip : '',
  };
}

function normalizeLocalOrder(order) {
  const createdAt = toIsoDate(order.createdAt);

  return {
    id: normalizeId(order.id ?? `order-${Date.now().toString(36)}`),
    orderNumber: order.orderNumber ?? formatOrderNumber(new Date(createdAt)),
    userId: normalizeId(order.userId ?? '') || null,
    customerName: order.customerName ?? '',
    customerEmail: order.customerEmail ?? '',
    customerPhone: order.customerPhone ?? '',
    shippingAddress: normalizeShippingAddress(order.shippingAddress),
    items: normalizeOrderItems(order.items),
    subtotal: Number(order.subtotal ?? 0),
    shipping: Number(order.shipping ?? 0),
    tax: Number(order.tax ?? 0),
    total: Number(order.total ?? 0),
    status: normalizeStatus(order.status),
    paymentStatus: normalizePaymentStatus(order.paymentStatus),
    paymentProvider: normalizePaymentProvider(order.paymentProvider),
    currency: normalizeCurrency(order.currency),
    paidAt: normalizePaidAt(order.paidAt),
    stripeCheckoutSessionId: typeof order.stripeCheckoutSessionId === 'string' ? order.stripeCheckoutSessionId : '',
    stripePaymentIntentId: typeof order.stripePaymentIntentId === 'string' ? order.stripePaymentIntentId : '',
    createdAt,
    updatedAt: toIsoDate(order.updatedAt ?? createdAt),
    demoMode: order.demoMode ?? true,
  };
}

function normalizeLocalOrders(orders = []) {
  return Array.isArray(orders) ? orders.map(normalizeLocalOrder) : [];
}

function getFriendlyOrdersError(error, fallbackMessage) {
  if (error instanceof Error && error.message.trim()) {
    const message = error.message;
    const lower = message.toLowerCase();
    if (
      lower.includes('permission denied for table orders') ||
      lower.includes('permission denied for table order_items') ||
      lower.includes('row-level security') ||
      lower.includes('violates row-level security')
    ) {
      return 'ShopOra could not load or save your orders because the live Supabase orders tables are missing the required permissions. Re-run supabase/schema.sql.';
    }
    return message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallbackMessage;
}

function sortOrders(orders) {
  return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function toCustomerName(user, fallback = '') {
  const parts = [user?.firstName, user?.lastName].map((part) => String(part ?? '').trim()).filter(Boolean);
  return parts.join(' ') || fallback || '';
}

export function OrdersProvider({ children }) {
  const { currentUser, authSource, isAuthLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersSource, setOrdersSource] = useState('local');
  const [isOrdersLoading, setIsOrdersLoading] = useState(Boolean(isSupabaseConfigured));
  const [ordersError, setOrdersError] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadLocalOrders = useCallback(() => {
    const nextOrders = normalizeLocalOrders(readStoredOrders());
    if (mountedRef.current) {
      setOrders(nextOrders);
      setOrdersSource('local');
      setOrdersError('');
      setIsOrdersLoading(false);
    }
    return nextOrders;
  }, []);

  const loadSupabaseOrders = useCallback(async () => {
    if (!currentUser?.id || currentUser.role === 'admin') {
      return loadLocalOrders();
    }

    if (mountedRef.current) {
      setIsOrdersLoading(true);
      setOrdersError('');
    }

    try {
      const nextOrders = await getSupabaseOrders();
      if (!mountedRef.current) {
        return nextOrders;
      }

      setOrders(nextOrders);
      setOrdersSource('supabase');
      setOrdersError('');
      setIsOrdersLoading(false);
      return nextOrders;
    } catch (error) {
      const friendlyError = getFriendlyOrdersError(error, 'Unable to load your orders right now.');
      console.warn('ShopOra could not load Supabase orders.', error);
      if (mountedRef.current) {
        setOrders([]);
        setOrdersSource('supabase');
        setOrdersError(friendlyError);
        setIsOrdersLoading(false);
      }
      return [];
    }
  }, [currentUser?.id, currentUser?.role, loadLocalOrders]);

  useEffect(() => {
    if (isAuthLoading) {
      return undefined;
    }

    if (authSource === 'supabase' && currentUser?.id && currentUser.role !== 'admin') {
      void loadSupabaseOrders();
      return undefined;
    }

    loadLocalOrders();
    return undefined;
  }, [authSource, currentUser?.id, currentUser?.role, isAuthLoading, loadLocalOrders, loadSupabaseOrders]);

  const createLocalOrder = useCallback(
    (orderData) => {
      const now = new Date();
      const normalized = normalizeLocalOrder({
        ...orderData,
        id: normalizeId(orderData.id ?? `order-${now.getTime().toString(36)}`),
        orderNumber: orderData.orderNumber ?? formatOrderNumber(now),
        createdAt: orderData.createdAt ?? now.toISOString(),
        updatedAt: orderData.updatedAt ?? now.toISOString(),
        status: orderData.status ?? 'Pending',
        paymentStatus: orderData.paymentStatus ?? 'Demo Paid',
        paymentProvider: orderData.paymentProvider ?? 'Demo',
        currency: orderData.currency ?? 'USD',
        paidAt: orderData.paidAt ?? null,
        stripeCheckoutSessionId: orderData.stripeCheckoutSessionId ?? '',
        stripePaymentIntentId: orderData.stripePaymentIntentId ?? '',
        demoMode: true,
        shippingAddress: orderData.shippingAddress ?? {},
        items: orderData.items ?? [],
      });

      setOrders((current) => {
        const nextOrders = [normalized, ...current];
        writeStoredOrders(nextOrders);
        return nextOrders;
      });

      return normalized;
    },
    [],
  );

  const createOrder = useCallback(
    async (orderData) => {
      if (authSource === 'supabase' && currentUser?.id && currentUser.role !== 'admin') {
        try {
          const created = await createSupabaseOrder({
            user: currentUser,
            cartItems: orderData.items ?? [],
            totals: {
              subtotal: orderData.subtotal ?? 0,
              shipping: orderData.shipping ?? 0,
              tax: orderData.tax ?? 0,
              total: orderData.total ?? 0,
            },
            shippingAddress: orderData.shippingAddress ?? {},
            customerInfo: {
              email: orderData.customerEmail ?? currentUser.email ?? '',
              name: orderData.customerName ?? toCustomerName(currentUser, ''),
              phone: orderData.customerPhone ?? currentUser.phone ?? '',
            },
            paymentStatus: orderData.paymentStatus ?? 'Pending',
            paymentProvider: orderData.paymentProvider ?? 'Demo',
            currency: orderData.currency ?? 'USD',
          });

          if (mountedRef.current) {
            setOrders((current) => [created, ...current.filter((order) => !idsMatch(order.id, created.id))]);
            setOrdersSource('supabase');
            setOrdersError('');
          }

          return created;
        } catch (error) {
          const friendlyError = getFriendlyOrdersError(error, 'Unable to place your order right now.');
          if (mountedRef.current) {
            setOrdersError(friendlyError);
          }
          throw new Error(friendlyError);
        }
      }

      return createLocalOrder(orderData);
    },
    [authSource, currentUser, createLocalOrder],
  );

  const getOrdersByUser = useCallback(
    (userId) => {
      const cleanUserId = normalizeId(userId);
      if (!cleanUserId) return [];
      return sortOrders(orders.filter((order) => idsMatch(order.userId, cleanUserId)));
    },
    [orders],
  );

  const getOrderById = useCallback(
    (orderId) => orders.find((order) => idsMatch(order.id, orderId)) ?? null,
    [orders],
  );

  const fetchOrderById = useCallback(
    async (orderId) => {
      const cleanOrderId = normalizeId(orderId);
      if (!cleanOrderId) {
        return null;
      }

      const existingOrder = orders.find((order) => idsMatch(order.id, cleanOrderId)) ?? null;
      if (existingOrder) {
        return existingOrder;
      }

      if (ordersSource !== 'supabase' || !currentUser?.id || currentUser.role === 'admin' || isOrdersLoading) {
        return null;
      }

      try {
        const nextOrder = await getSupabaseOrderById(cleanOrderId);
        if (!nextOrder || !idsMatch(nextOrder.userId, currentUser.id)) {
          return null;
        }

        if (mountedRef.current) {
          setOrders((current) => [nextOrder, ...current.filter((order) => !idsMatch(order.id, nextOrder.id))]);
          setOrdersSource('supabase');
          setOrdersError('');
        }

        return nextOrder;
      } catch (error) {
        const friendlyError = getFriendlyOrdersError(error, 'Unable to load that order right now.');
        console.warn('ShopOra could not load a Supabase order by id.', error);
        if (mountedRef.current) {
          setOrdersError(friendlyError);
        }
        return null;
      }
    },
    [currentUser?.id, currentUser?.role, isOrdersLoading, orders, ordersSource],
  );

  const fetchOrderByStripeCheckoutSessionId = useCallback(
    async (sessionId) => {
      const cleanSessionId = normalizeId(sessionId);
      if (!cleanSessionId) {
        return null;
      }

      const existingOrder = orders.find((order) => idsMatch(order.stripeCheckoutSessionId, cleanSessionId)) ?? null;
      if (existingOrder) {
        return existingOrder;
      }

      if (ordersSource !== 'supabase' || !currentUser?.id || currentUser.role === 'admin' || isOrdersLoading) {
        return null;
      }

      try {
        const nextOrder = await getSupabaseOrderByStripeCheckoutSessionId(cleanSessionId);
        if (!nextOrder || !idsMatch(nextOrder.userId, currentUser.id)) {
          return null;
        }

        if (mountedRef.current) {
          setOrders((current) => [nextOrder, ...current.filter((order) => !idsMatch(order.id, nextOrder.id))]);
          setOrdersSource('supabase');
          setOrdersError('');
        }

        return nextOrder;
      } catch (error) {
        const friendlyError = getFriendlyOrdersError(error, 'Unable to load that order right now.');
        console.warn('ShopOra could not load a Supabase order by session id.', error);
        if (mountedRef.current) {
          setOrdersError(friendlyError);
        }
        return null;
      }
    },
    [currentUser?.id, currentUser?.role, isOrdersLoading, orders, ordersSource],
  );

  const updateOrderStatus = useCallback(
    (orderId, status) => {
      if (ordersSource !== 'local' || !VALID_STATUSES.includes(status)) return null;

      let updatedOrder = null;
      setOrders((current) => {
        const nextOrders = current.map((order) => {
          if (!idsMatch(order.id, orderId)) return order;
          updatedOrder = {
            ...order,
            status,
            updatedAt: new Date().toISOString(),
          };
          return updatedOrder;
        });
        writeStoredOrders(nextOrders);
        return nextOrders;
      });

      return updatedOrder;
    },
    [ordersSource],
  );

  const cancelOrder = useCallback(
    (orderId) => {
      if (ordersSource !== 'local') return null;

      let updatedOrder = null;
      setOrders((current) => {
        const nextOrders = current.map((order) => {
          if (!idsMatch(order.id, orderId)) return order;
          updatedOrder = {
            ...order,
            status: 'Cancelled',
            paymentStatus: 'Refunded',
            updatedAt: new Date().toISOString(),
          };
          return updatedOrder;
        });
        writeStoredOrders(nextOrders);
        return nextOrders;
      });

      return updatedOrder;
    },
    [ordersSource],
  );

  const resetOrders = useCallback(() => {
    if (ordersSource !== 'local') return false;
    setOrders([]);
    writeStoredOrders([]);
    return true;
  }, [ordersSource]);

  const value = useMemo(
    () => ({
      orders,
      ordersSource,
      isOrdersLoading,
      ordersError,
      createOrder,
      getOrdersByUser,
      getOrderById,
      fetchOrderById,
      fetchOrderByStripeCheckoutSessionId,
      updateOrderStatus,
      cancelOrder,
      resetOrders,
    }),
    [
      orders,
      ordersSource,
      isOrdersLoading,
      ordersError,
      createOrder,
      getOrdersByUser,
      getOrderById,
      fetchOrderById,
      fetchOrderByStripeCheckoutSessionId,
      updateOrderStatus,
      cancelOrder,
      resetOrders,
    ],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
