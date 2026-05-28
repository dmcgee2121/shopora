import { isSupabaseConfigured, supabase, supabaseAnonKey, supabaseUrl } from '../lib/supabaseClient';
import { normalizeOrderItems } from '../utils/orderItemUtils';
import { idsMatch, normalizeId } from '../utils/idUtils';

const NOT_CONFIGURED_MESSAGE = 'Supabase orders are not configured yet.';
const ORDERS_UNAVAILABLE_MESSAGE = 'Supabase orders are unavailable right now.';

function ensureSupabaseOrdersReady() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }

  return supabase;
}

function getCleanErrorMessage(error, fallbackMessage) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallbackMessage;
}

function getFriendlyOrdersError(error, fallbackMessage) {
  const message = getCleanErrorMessage(error, fallbackMessage);
  const lower = message.toLowerCase();

  if (
    lower.includes('permission denied for table orders') ||
    lower.includes('permission denied for table order_items') ||
    lower.includes('row-level security') ||
    lower.includes('violates row-level security')
  ) {
    const action = fallbackMessage.toLowerCase().includes('load') ? 'load' : 'save';
    return `ShopOra could not ${action} your orders because the live Supabase orders tables are missing the required permissions. Re-run supabase/schema.sql.`;
  }

  if (lower.includes('admin access required')) {
    return 'ShopOra could not load admin orders because the signed-in Supabase account is not marked as an admin in public.profiles.';
  }

  return message;
}

function parseRestResponse(text, fallbackMessage) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text || fallbackMessage };
  }
}

function parseRestErrorMessage(text, fallbackMessage) {
  const parsed = parseRestResponse(text, fallbackMessage);

  if (!parsed) {
    return fallbackMessage;
  }

  if (typeof parsed === 'string') {
    return parsed;
  }

  return parsed.message || parsed.error_description || parsed.details || fallbackMessage;
}

async function getCurrentOrdersSession() {
  const client = ensureSupabaseOrdersReady();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw new Error(getFriendlyOrdersError(error, ORDERS_UNAVAILABLE_MESSAGE));
  }

  const session = data?.session ?? null;
  const accessToken = session?.access_token ?? null;
  const userId = session?.user?.id ?? null;

  if (!accessToken || !userId) {
    throw new Error('No Supabase session is available.');
  }

  return { accessToken, userId };
}

async function getCurrentOrdersSessionSafe() {
  try {
    return await getCurrentOrdersSession();
  } catch (error) {
    console.warn('ShopOra orders session is unavailable.', error);
    return null;
  }
}

async function requestOrders(path, { method = 'GET', body, accessToken, prefer = 'return=representation' } = {}) {
  if (!isSupabaseConfigured || !supabase || !supabaseUrl) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }

  const session = accessToken ? { accessToken } : await getCurrentOrdersSessionSafe();
  if (!session?.accessToken) {
    throw new Error('No Supabase session is available.');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/orders${path}`, {
    method,
    headers: {
      apikey: supabaseAnonKey ?? '',
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(parseRestErrorMessage(text, ORDERS_UNAVAILABLE_MESSAGE));
  }

  return text ? parseRestResponse(text, ORDERS_UNAVAILABLE_MESSAGE) : null;
}

async function requestOrderItems(path, { method = 'GET', body, accessToken, prefer = 'return=representation' } = {}) {
  if (!isSupabaseConfigured || !supabase || !supabaseUrl) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }

  const session = accessToken ? { accessToken } : await getCurrentOrdersSessionSafe();
  if (!session?.accessToken) {
    throw new Error('No Supabase session is available.');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/order_items${path}`, {
    method,
    headers: {
      apikey: supabaseAnonKey ?? '',
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(parseRestErrorMessage(text, ORDERS_UNAVAILABLE_MESSAGE));
  }

  return text ? parseRestResponse(text, ORDERS_UNAVAILABLE_MESSAGE) : null;
}

function pad(value, length) {
  return String(value).padStart(length, '0');
}

function formatOrderNumber(date = new Date()) {
  const stamp = [date.getFullYear(), pad(date.getMonth() + 1, 2), pad(date.getDate(), 2)].join('');
  const suffix = pad(Math.floor(Math.random() * 10000), 4);
  return `SO-${stamp}-${suffix}`;
}

function toIsoDate(input) {
  const date = input ? new Date(input) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normalizeStatus(status) {
  const clean = typeof status === 'string' ? status.trim().toLowerCase() : '';
  switch (clean) {
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Processing';
  }
}

function normalizePaymentStatus(status) {
  const clean = typeof status === 'string' ? status.trim().toLowerCase() : '';
  switch (clean) {
    case 'demo':
      return 'Demo';
    case 'demo paid':
      return 'Demo Paid';
    case 'demo pending':
      return 'Demo Pending';
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Processing';
    case 'failed':
      return 'Failed';
    case 'expired':
      return 'Expired';
    case 'refunded':
      return 'Refunded';
    default:
      return 'Pending';
  }
}

function normalizePaymentProvider(provider) {
  const clean = typeof provider === 'string' ? provider.trim().toLowerCase() : '';
  switch (clean) {
    case 'stripe':
      return 'Stripe';
    case 'demo':
      return 'Demo';
    default:
      return 'Demo';
  }
}

function normalizeCurrency(currency) {
  const clean = typeof currency === 'string' ? currency.trim().toUpperCase() : '';
  return clean || 'USD';
}

function normalizeTimestamp(value) {
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

function normalizeOrder(order, items = []) {
  const safeOrder = order && typeof order === 'object' ? order : {};
  const createdAt = toIsoDate(safeOrder.createdAt ?? safeOrder.created_at);

  return {
    id: normalizeId(safeOrder.id),
    orderNumber: typeof safeOrder.orderNumber === 'string'
      ? safeOrder.orderNumber
      : typeof safeOrder.order_number === 'string'
        ? safeOrder.order_number
        : formatOrderNumber(new Date(createdAt)),
    userId: normalizeId(safeOrder.userId ?? safeOrder.user_id) || null,
    customerName: typeof safeOrder.customerName === 'string'
      ? safeOrder.customerName
      : typeof safeOrder.customer_name === 'string'
        ? safeOrder.customer_name
        : '',
    customerEmail: typeof safeOrder.customerEmail === 'string'
      ? safeOrder.customerEmail
      : typeof safeOrder.customer_email === 'string'
        ? safeOrder.customer_email
        : '',
    customerPhone: typeof safeOrder.customerPhone === 'string'
      ? safeOrder.customerPhone
      : typeof safeOrder.customer_phone === 'string'
        ? safeOrder.customer_phone
        : '',
    shippingAddress: normalizeShippingAddress(safeOrder.shippingAddress ?? safeOrder.shipping_address),
    items: normalizeOrderItems(items),
    subtotal: Number(safeOrder.subtotal ?? 0),
    shipping: Number(safeOrder.shipping ?? 0),
    tax: Number(safeOrder.tax ?? 0),
    total: Number(safeOrder.total ?? 0),
    status: normalizeStatus(safeOrder.status),
    paymentStatus: normalizePaymentStatus(safeOrder.paymentStatus ?? safeOrder.payment_status),
    paymentProvider: normalizePaymentProvider(safeOrder.paymentProvider ?? safeOrder.payment_provider),
    currency: normalizeCurrency(safeOrder.currency),
    paidAt: normalizeTimestamp(safeOrder.paidAt ?? safeOrder.paid_at),
    stripeCheckoutSessionId:
      typeof safeOrder.stripeCheckoutSessionId === 'string'
        ? safeOrder.stripeCheckoutSessionId
        : typeof safeOrder.stripe_checkout_session_id === 'string'
          ? safeOrder.stripe_checkout_session_id
          : '',
    stripePaymentIntentId:
      typeof safeOrder.stripePaymentIntentId === 'string'
        ? safeOrder.stripePaymentIntentId
        : typeof safeOrder.stripe_payment_intent_id === 'string'
          ? safeOrder.stripe_payment_intent_id
          : '',
    createdAt,
    updatedAt: toIsoDate(safeOrder.updatedAt ?? safeOrder.updated_at ?? createdAt),
    demoMode: false,
  };
}

function buildOrderPayload({
  user,
  totals = {},
  shippingAddress = {},
  customerInfo = {},
  orderNumber,
  paymentStatus = 'pending',
  paymentProvider = 'demo',
  currency = 'usd',
}) {
  const safeUser = user && typeof user === 'object' ? user : {};
  const safeTotals = totals && typeof totals === 'object' ? totals : {};
  const safeCustomerInfo = customerInfo && typeof customerInfo === 'object' ? customerInfo : {};
  const safeShippingAddress = normalizeShippingAddress(shippingAddress);
  const customerName =
    typeof safeCustomerInfo.name === 'string' && safeCustomerInfo.name.trim()
      ? safeCustomerInfo.name.trim()
      : [safeUser.firstName, safeUser.lastName].map((part) => String(part ?? '').trim()).filter(Boolean).join(' ') || '';

  return {
    user_id: normalizeId(safeUser.id),
    order_number: typeof orderNumber === 'string' && orderNumber.trim() ? orderNumber.trim() : formatOrderNumber(),
    status: 'processing',
    payment_status: typeof paymentStatus === 'string' && paymentStatus.trim() ? paymentStatus.trim().toLowerCase() : 'pending',
    payment_provider: typeof paymentProvider === 'string' && paymentProvider.trim() ? paymentProvider.trim().toLowerCase() : 'demo',
    currency: typeof currency === 'string' && currency.trim() ? currency.trim().toLowerCase() : 'usd',
    subtotal: Number(safeTotals.subtotal ?? 0),
    shipping: Number(safeTotals.shipping ?? 0),
    tax: Number(safeTotals.tax ?? 0),
    total: Number(safeTotals.total ?? 0),
    customer_email: typeof safeCustomerInfo.email === 'string'
      ? safeCustomerInfo.email.trim().toLowerCase()
      : typeof safeUser.email === 'string'
        ? safeUser.email.trim().toLowerCase()
        : '',
    customer_name: customerName,
    shipping_address: safeShippingAddress,
  };
}

function normalizeCartItemForOrder(item) {
  const safeItem = item && typeof item === 'object' ? item : {};
  const quantity = Number(safeItem.quantity ?? 1);
  const unitPrice = Number(safeItem.unitPrice ?? safeItem.price ?? 0);
  const lineTotal = Number(safeItem.lineTotal ?? unitPrice * quantity);

  return {
    productId: normalizeId(safeItem.productId ?? safeItem.id),
    name: typeof safeItem.name === 'string' ? safeItem.name : '',
    brand: typeof safeItem.brand === 'string' ? safeItem.brand : '',
    image: typeof safeItem.image === 'string' ? safeItem.image : '',
    sku: typeof safeItem.sku === 'string' ? safeItem.sku : '',
    size: typeof safeItem.size === 'string' ? safeItem.size : '',
    color: typeof safeItem.color === 'string' ? safeItem.color : '',
    quantity,
    unitPrice,
    lineTotal,
  };
}

function buildOrderItemsPayload(cartItems = []) {
  return Array.isArray(cartItems)
    ? cartItems.map(normalizeCartItemForOrder).filter((item) => item.name)
    : [];
}

function buildOrderItemsInsertPayload(orderId, cartItems = []) {
  return buildOrderItemsPayload(cartItems).map((item) => ({
    order_id: orderId,
    product_id: item.productId || null,
    product_name: item.name,
    product_brand: item.brand || '',
    product_image: item.image || '',
    sku: item.sku || '',
    selected_size: item.size || '',
    selected_color: item.color || '',
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.lineTotal,
  }));
}

async function getOrdersWithItemsByUserId(userId, accessToken) {
  const cleanUserId = normalizeId(userId);
  if (!cleanUserId) {
    return [];
  }

  const orderRows = await requestOrders(`?user_id=eq.${encodeURIComponent(cleanUserId)}&select=*&order=created_at.desc`, {
    accessToken,
    prefer: 'return=minimal',
  });

  const orders = Array.isArray(orderRows) ? orderRows : [];
  const orderIds = orders.map((order) => normalizeId(order.id)).filter(Boolean);
  if (!orderIds.length) {
    return [];
  }

  const itemRows = await requestOrderItems(
    `?order_id=in.(${orderIds.join(',')})&select=*&order=created_at.asc`,
    {
      accessToken,
      prefer: 'return=minimal',
    },
  );

  const itemsByOrderId = new Map();
  for (const item of Array.isArray(itemRows) ? itemRows : []) {
    const orderId = normalizeId(item?.order_id);
    if (!orderId) continue;
    const current = itemsByOrderId.get(orderId) ?? [];
    current.push(item);
    itemsByOrderId.set(orderId, current);
  }

  return orders.map((order) => normalizeOrder(order, itemsByOrderId.get(normalizeId(order.id)) ?? []));
}

async function getAdminOrdersWithItems() {
  const client = ensureSupabaseOrdersReady();
  const { data, error } = await client.rpc('get_admin_orders');

  if (error) {
    throw new Error(getFriendlyOrdersError(error, 'Unable to load admin orders right now.'));
  }

  const orders = Array.isArray(data) ? data : [];
  return orders.map((order) => normalizeOrder(order, Array.isArray(order?.items) ? order.items : []));
}

async function getOrderWithItemsById(orderId, accessToken) {
  const cleanOrderId = normalizeId(orderId);
  if (!cleanOrderId) {
    return null;
  }

  const orderRows = await requestOrders(`?id=eq.${encodeURIComponent(cleanOrderId)}&select=*`, {
    accessToken,
    prefer: 'return=minimal',
  });
  const order = Array.isArray(orderRows) ? orderRows[0] : orderRows;
  if (!order) {
    return null;
  }

  const itemRows = await requestOrderItems(`?order_id=eq.${encodeURIComponent(cleanOrderId)}&select=*&order=created_at.asc`, {
    accessToken,
    prefer: 'return=minimal',
  });

  return normalizeOrder(order, Array.isArray(itemRows) ? itemRows : []);
}

async function getOrderWithItemsByStripeCheckoutSessionId(sessionId, accessToken) {
  const cleanSessionId = normalizeId(sessionId);
  if (!cleanSessionId) {
    return null;
  }

  const orderRows = await requestOrders(`?stripe_checkout_session_id=eq.${encodeURIComponent(cleanSessionId)}&select=*`, {
    accessToken,
    prefer: 'return=minimal',
  });
  const order = Array.isArray(orderRows) ? orderRows[0] : orderRows;
  if (!order) {
    return null;
  }

  const orderId = normalizeId(order.id);
  if (!orderId) {
    return normalizeOrder(order, []);
  }

  const itemRows = await requestOrderItems(`?order_id=eq.${encodeURIComponent(orderId)}&select=*&order=created_at.asc`, {
    accessToken,
    prefer: 'return=minimal',
  });

  return normalizeOrder(order, Array.isArray(itemRows) ? itemRows : []);
}

export async function createSupabaseOrder({
  user,
  cartItems,
  totals,
  shippingAddress,
  customerInfo,
  paymentStatus,
  paymentProvider,
  currency,
} = {}) {
  const session = await getCurrentOrdersSession();
  const cleanUserId = normalizeId(user?.id ?? session.userId);

  if (!cleanUserId) {
    throw new Error('A valid user id is required.');
  }

  const orderItems = buildOrderItemsPayload(cartItems);
  if (!orderItems.length) {
    throw new Error('Add items to your cart before placing an order.');
  }

  const orderPayload = buildOrderPayload({
    user: { ...user, id: cleanUserId },
    totals,
    shippingAddress,
    customerInfo,
    orderNumber: formatOrderNumber(),
    paymentStatus,
    paymentProvider,
    currency,
  });

  const { data: orderRow, error } = await supabase.rpc('create_customer_order', {
    order_payload: orderPayload,
    items_payload: orderItems,
  });

  if (error) {
    throw new Error(getFriendlyOrdersError(error, 'Unable to place your order right now.'));
  }

  if (!orderRow) {
    throw new Error('Unable to place your order right now.');
  }

  return normalizeOrder(orderRow, buildOrderItemsInsertPayload(orderRow.id, cartItems));
}

export async function getSupabaseOrders() {
  try {
    const session = await getCurrentOrdersSession();
    return await getOrdersWithItemsByUserId(session.userId, session.accessToken);
  } catch (error) {
    throw new Error(getFriendlyOrdersError(error, 'Unable to load your orders right now.'));
  }
}

export async function getSupabaseCustomerOrderHistory() {
  return getSupabaseOrders();
}

export async function getSupabaseAdminOrders() {
  try {
    return await getAdminOrdersWithItems();
  } catch (error) {
    throw new Error(getFriendlyOrdersError(error, 'Unable to load admin orders right now.'));
  }
}

export async function getSupabaseOrderById(orderId) {
  try {
    const session = await getCurrentOrdersSession();
    return await getOrderWithItemsById(orderId, session.accessToken);
  } catch (error) {
    throw new Error(getFriendlyOrdersError(error, 'Unable to load that order right now.'));
  }
}

export async function getSupabaseOrderByStripeCheckoutSessionId(sessionId) {
  try {
    const session = await getCurrentOrdersSession();
    return await getOrderWithItemsByStripeCheckoutSessionId(sessionId, session.accessToken);
  } catch (error) {
    throw new Error(getFriendlyOrdersError(error, 'Unable to load that order right now.'));
  }
}
