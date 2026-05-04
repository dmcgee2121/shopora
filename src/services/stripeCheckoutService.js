import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const FUNCTION_BASE = import.meta.env.VITE_NETLIFY_FUNCTIONS_BASE_URL ?? '/.netlify/functions';
const CHECKOUT_SESSION_MESSAGE = 'Stripe checkout is unavailable right now.';

function normalizeBasePath(basePath) {
  const clean = typeof basePath === 'string' ? basePath.trim() : '';
  if (!clean) return '/.netlify/functions';
  return clean.replace(/\/$/, '');
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
  const response = await fetch(`${normalizeBasePath(FUNCTION_BASE)}/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ orderId: cleanOrderId }),
  });

  const text = await response.text();
  const payload = parseResponseBody(text);

  if (!response.ok) {
    const message =
      payload?.error ||
      payload?.message ||
      'ShopOra could not start Stripe Checkout right now. Your order was saved, but payment could not continue.';
    throw new Error(message);
  }

  if (!payload?.url) {
    throw new Error('Stripe Checkout did not return a redirect URL.');
  }

  return payload;
}
