import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const FUNCTION_BASE = import.meta.env.VITE_NETLIFY_FUNCTIONS_BASE_URL ?? '/.netlify/functions';
const CHECKOUT_SESSION_MESSAGE = 'Stripe checkout is unavailable right now.';
const CHECKOUT_SESSION_ENDPOINT = `${normalizeBasePath(FUNCTION_BASE)}/create-checkout-session`;

function normalizeBasePath(basePath) {
  const clean = typeof basePath === 'string' ? basePath.trim() : '';
  if (!clean) return '/.netlify/functions';
  return clean.replace(/\/$/, '');
}

function isLocalDebugMode() {
  if (import.meta.env.DEV) {
    return true;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
}

function getFriendlyErrorMessage(error, fallbackMessage) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallbackMessage;
}

function logCheckoutDebug(details) {
  if (!isLocalDebugMode()) {
    return;
  }

  console.warn('ShopOra Stripe Checkout debug', details);
}

async function getCurrentSupabaseAccessToken() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(getFriendlyErrorMessage(error, CHECKOUT_SESSION_MESSAGE));
  }

  const accessToken = data?.session?.access_token ?? null;
  if (!accessToken) {
    throw new Error('No Supabase session is available.');
  }

  return accessToken;
}

function parseResponseBody(text) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function createStripeCheckoutSession(orderId) {
  const cleanOrderId = typeof orderId === 'string' ? orderId.trim() : '';
  if (!cleanOrderId) {
    throw new Error('A valid order id is required.');
  }

  const accessToken = await getCurrentSupabaseAccessToken();
  let response;

  try {
    response = await fetch(CHECKOUT_SESSION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ orderId: cleanOrderId }),
    });
  } catch (error) {
    logCheckoutDebug({
      endpoint: CHECKOUT_SESSION_ENDPOINT,
      status: null,
      message: error instanceof Error && error.message.trim() ? error.message : 'Network request failed.',
      missingEnvVar: null,
    });
    throw new Error('ShopOra could not start Stripe Checkout right now. Your order was saved, but payment could not continue.');
  }

  const text = await response.text();
  const payload = parseResponseBody(text);
  const responseMessage =
    (payload && typeof payload === 'object' && (payload.error || payload.message)) ||
    'ShopOra could not start Stripe Checkout right now. Your order was saved, but payment could not continue.';

  if (!response.ok) {
    logCheckoutDebug({
      endpoint: CHECKOUT_SESSION_ENDPOINT,
      status: response.status,
      message: responseMessage,
      missingEnvVar: payload?.missingEnvVar ?? null,
    });
    throw new Error('ShopOra could not start Stripe Checkout right now. Your order was saved, but payment could not continue.');
  }

  if (!payload?.url) {
    logCheckoutDebug({
      endpoint: CHECKOUT_SESSION_ENDPOINT,
      status: response.status,
      message: 'Stripe Checkout did not return a redirect URL.',
      missingEnvVar: null,
    });
    throw new Error('ShopOra could not start Stripe Checkout right now. Your order was saved, but payment could not continue.');
  }

  return payload;
}
