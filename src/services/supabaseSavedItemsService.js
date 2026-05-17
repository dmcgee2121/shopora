import { isSupabaseConfigured, supabase, supabaseAnonKey, supabaseUrl } from '../lib/supabaseClient';
import { idsMatch, normalizeId } from '../utils/idUtils';

const NOT_CONFIGURED_MESSAGE = 'Supabase saved items are not configured yet.';
const SAVED_ITEMS_UNAVAILABLE_MESSAGE = 'Supabase saved items are unavailable right now.';

function ensureSupabaseSavedItemsReady() {
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

function getFriendlySavedItemsError(error, fallbackMessage) {
  const message = getCleanErrorMessage(error, fallbackMessage);
  const lower = message.toLowerCase();

  if (
    lower.includes('permission denied for table saved_items') ||
    lower.includes('row-level security') ||
    lower.includes('violates row-level security')
  ) {
    const action = fallbackMessage.toLowerCase().includes('load') ? 'load' : 'update';
    return `ShopOra could not ${action} your saved items because the live Supabase saved_items table is missing the required permissions. Re-run supabase/schema.sql.`;
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

async function getCurrentSavedItemsSession() {
  const client = ensureSupabaseSavedItemsReady();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw new Error(getFriendlySavedItemsError(error, SAVED_ITEMS_UNAVAILABLE_MESSAGE));
  }

  const session = data?.session ?? null;
  const accessToken = session?.access_token ?? null;
  const userId = session?.user?.id ?? null;

  if (!accessToken || !userId) {
    throw new Error('No Supabase session is available.');
  }

  return { accessToken, userId };
}

async function getCurrentSavedItemsSessionSafe() {
  try {
    return await getCurrentSavedItemsSession();
  } catch (error) {
    console.warn('ShopOra saved-items session is unavailable.', error);
    return null;
  }
}

async function requestSavedItems(path, { method = 'GET', body, accessToken, prefer = 'return=representation' } = {}) {
  if (!isSupabaseConfigured || !supabase || !supabaseUrl) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }

  const session = accessToken ? { accessToken } : await getCurrentSavedItemsSessionSafe();
  if (!session?.accessToken) {
    throw new Error('No Supabase session is available.');
  }

  const token = session.accessToken;
  const response = await fetch(`${supabaseUrl}/rest/v1/saved_items${path}`, {
    method,
    headers: {
      apikey: supabaseAnonKey ?? '',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(parseRestErrorMessage(text, SAVED_ITEMS_UNAVAILABLE_MESSAGE));
  }

  return text ? parseRestResponse(text, SAVED_ITEMS_UNAVAILABLE_MESSAGE) : null;
}

function normalizeSavedProductIds(savedProductIds) {
  return Array.isArray(savedProductIds) ? savedProductIds.map(normalizeId).filter(Boolean) : [];
}

function appendSavedProductId(savedProductIds, productId) {
  const cleanProductId = normalizeId(productId);
  if (!cleanProductId) {
    return normalizeSavedProductIds(savedProductIds);
  }

  return normalizeSavedProductIds([...normalizeSavedProductIds(savedProductIds), cleanProductId]);
}

function removeSavedProductIdFromList(savedProductIds, productId) {
  const cleanProductId = normalizeId(productId);
  if (!cleanProductId) {
    return normalizeSavedProductIds(savedProductIds);
  }

  return normalizeSavedProductIds(savedProductIds).filter((id) => !idsMatch(id, cleanProductId));
}

async function getSavedProductIdsForSession(accessToken, userId) {
  const rows = await requestSavedItems(`?user_id=eq.${encodeURIComponent(userId)}&select=product_id&order=created_at.asc`, {
    accessToken,
    prefer: 'return=minimal',
  });

  return normalizeSavedProductIds(Array.isArray(rows) ? rows.map((row) => row.product_id) : []);
}

async function getSavedProductIdsForCurrentSupabaseUserInternal() {
  const session = await getCurrentSavedItemsSessionSafe();
  if (!session?.accessToken || !session?.userId) {
    return [];
  }

  const { accessToken, userId } = session;
  return getSavedProductIdsForSession(accessToken, userId);
}

async function saveSavedProductIdInternal(productId, currentSavedProductIds = null) {
  const cleanProductId = normalizeId(productId);
  if (!cleanProductId) {
    throw new Error('A valid product id is required.');
  }

  const session = await getCurrentSavedItemsSession();

  const { accessToken, userId } = session;
  const currentIds = normalizeSavedProductIds(
    currentSavedProductIds ?? (await getSavedProductIdsForSession(accessToken, userId)),
  );

  if (currentIds.some((id) => idsMatch(id, cleanProductId))) {
    return currentIds;
  }

  await requestSavedItems('?on_conflict=user_id,product_id', {
    method: 'POST',
    accessToken,
    body: {
      user_id: userId,
      product_id: cleanProductId,
    },
    prefer: 'resolution=ignore-duplicates,return=representation',
  });

  return appendSavedProductId(currentIds, cleanProductId);
}

async function removeSavedProductIdInternal(productId, currentSavedProductIds = null) {
  const cleanProductId = normalizeId(productId);
  if (!cleanProductId) {
    throw new Error('A valid product id is required.');
  }

  const session = await getCurrentSavedItemsSession();

  const { accessToken, userId } = session;
  const currentIds = normalizeSavedProductIds(
    currentSavedProductIds ?? (await getSavedProductIdsForSession(accessToken, userId)),
  );

  if (!currentIds.some((id) => idsMatch(id, cleanProductId))) {
    return currentIds;
  }

  await requestSavedItems(
    `?user_id=eq.${encodeURIComponent(userId)}&product_id=eq.${encodeURIComponent(cleanProductId)}`,
    {
      method: 'DELETE',
      accessToken,
      prefer: 'return=minimal',
    },
  );

  return removeSavedProductIdFromList(currentIds, cleanProductId);
}

export async function getSavedProductIdsForCurrentSupabaseUser() {
  try {
    return await getSavedProductIdsForCurrentSupabaseUserInternal();
  } catch (error) {
    throw new Error(getFriendlySavedItemsError(error, 'Unable to load your saved items right now.'));
  }
}

export async function saveSavedProductId(productId, currentSavedProductIds = null) {
  try {
    return await saveSavedProductIdInternal(productId, currentSavedProductIds);
  } catch (error) {
    throw new Error(getFriendlySavedItemsError(error, 'Unable to save that item right now.'));
  }
}

export async function removeSavedProductId(productId, currentSavedProductIds = null) {
  try {
    return await removeSavedProductIdInternal(productId, currentSavedProductIds);
  } catch (error) {
    throw new Error(getFriendlySavedItemsError(error, 'Unable to remove that item right now.'));
  }
}

export async function toggleSavedProductId(productId, currentSavedProductIds = null) {
  const cleanProductId = normalizeId(productId);
  if (!cleanProductId) {
    throw new Error('A valid product id is required.');
  }

  const currentIds = normalizeSavedProductIds(
    currentSavedProductIds ?? (await getSavedProductIdsForCurrentSupabaseUser()),
  );
  const isSaved = currentIds.some((id) => idsMatch(id, cleanProductId));

  return isSaved
    ? removeSavedProductId(cleanProductId, currentIds)
    : saveSavedProductId(cleanProductId, currentIds);
}
