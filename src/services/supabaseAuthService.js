import { isSupabaseConfigured, supabase, supabaseAnonKey, supabaseUrl } from '../lib/supabaseClient';
import { normalizeProfileFromSupabase, profileToSupabasePayload } from '../utils/authMappers';

const NOT_CONFIGURED_MESSAGE = 'Supabase auth is not configured yet.';
const AUTH_UNAVAILABLE_MESSAGE = 'Supabase auth is unavailable right now.';

function ensureSupabaseAuthReady() {
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

function normalizeAuthUser(user) {
  if (!user) return null;

  return {
    id: user.id ?? null,
    email: user.email ?? '',
    firstName: user.user_metadata?.first_name ?? user.user_metadata?.firstName ?? '',
    lastName: user.user_metadata?.last_name ?? user.user_metadata?.lastName ?? '',
  };
}

function buildProfileInput(user, profileData = {}) {
  const normalizedUser = normalizeAuthUser(user) ?? {};
  return {
    id: normalizedUser.id,
    email: profileData.email ?? normalizedUser.email ?? '',
    firstName: profileData.firstName ?? normalizedUser.firstName ?? '',
    lastName: profileData.lastName ?? normalizedUser.lastName ?? '',
    phone: profileData.phone ?? '',
    role: profileData.role ?? 'customer',
    defaultShippingAddress: profileData.defaultShippingAddress ?? {},
  };
}

async function getAccessToken() {
  const client = ensureSupabaseAuthReady();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw new Error(getCleanErrorMessage(error, AUTH_UNAVAILABLE_MESSAGE));
  }

  const accessToken = data?.session?.access_token ?? null;
  if (!accessToken) {
    throw new Error('No Supabase session is available.');
  }

  return accessToken;
}

async function requestProfiles(path, { method = 'GET', body, accessToken, prefer = 'return=representation' } = {}) {
  if (!isSupabaseConfigured || !supabase || !supabaseUrl) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }

  const token = accessToken ?? (await getAccessToken());
  const response = await fetch(`${supabaseUrl}/rest/v1/profiles${path}`, {
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
    throw new Error(text || AUTH_UNAVAILABLE_MESSAGE);
  }

  return text ? JSON.parse(text) : null;
}

async function insertSupabaseProfile(userId, profileData = {}, accessToken, payloadOptions = {}) {
  const cleanUserId = typeof userId === 'string' ? userId.trim() : '';

  if (!cleanUserId) {
    throw new Error('A valid user id is required.');
  }

  const payload = profileToSupabasePayload({
    id: cleanUserId,
    ...buildProfileInput({ id: cleanUserId }, profileData),
  }, payloadOptions);
  const { role: _role, ...safePayload } = payload ?? {};
  const rows = await requestProfiles('', {
    method: 'POST',
    body: safePayload,
    accessToken,
    prefer: 'return=representation',
  });

  return normalizeProfileFromSupabase(Array.isArray(rows) ? rows[0] : rows);
}

async function patchSupabaseProfile(userId, profileData = {}, accessToken, payloadOptions = {}) {
  const cleanUserId = typeof userId === 'string' ? userId.trim() : '';

  if (!cleanUserId) {
    throw new Error('A valid user id is required.');
  }

  const payload = profileToSupabasePayload({
    id: cleanUserId,
    ...buildProfileInput({ id: cleanUserId }, profileData),
  }, payloadOptions);
  const { role: _role, ...safePayload } = payload ?? {};
  const rows = await requestProfiles(`?id=eq.${encodeURIComponent(cleanUserId)}`, {
    method: 'PATCH',
    body: safePayload,
    accessToken,
    prefer: 'return=representation',
  });

  return normalizeProfileFromSupabase(Array.isArray(rows) ? rows[0] : rows);
}

async function upsertSupabaseProfile(userId, profileData = {}, accessToken, payloadOptions = {}) {
  const updated = await patchSupabaseProfile(userId, profileData, accessToken, payloadOptions);
  if (updated) {
    return updated;
  }

  return insertSupabaseProfile(userId, profileData, accessToken, payloadOptions);
}

export async function signUpWithSupabase({ firstName, lastName, email, password } = {}) {
  const client = ensureSupabaseAuthReady();
  const cleanFirstName = typeof firstName === 'string' ? firstName.trim() : '';
  const cleanLastName = typeof lastName === 'string' ? lastName.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanPassword = typeof password === 'string' ? password.trim() : '';

  if (!cleanFirstName || !cleanLastName || !cleanEmail || !cleanPassword) {
    throw new Error('Please complete all required fields.');
  }

  const { data, error } = await client.auth.signUp({
    email: cleanEmail,
    password: cleanPassword,
    options: {
      data: {
        first_name: cleanFirstName,
        last_name: cleanLastName,
      },
    },
  });

  if (error) {
    throw new Error(getCleanErrorMessage(error, 'Unable to create your account right now.'));
  }

  const authUser = data.user ?? null;
  const session = data.session ?? null;
  const profileInput = {
    firstName: cleanFirstName,
    lastName: cleanLastName,
    email: cleanEmail,
    phone: '',
    role: 'customer',
    defaultShippingAddress: {
      firstName: cleanFirstName,
      lastName: cleanLastName,
      street: '',
      city: '',
      state: '',
      zip: '',
    },
  };

  let profile = null;
  if (session && authUser) {
    profile = await insertSupabaseProfile(authUser.id, profileInput, session.access_token);
  }

  return {
    user: authUser,
    session,
    profile,
    needsEmailConfirmation: !session,
    message: !session
      ? 'Check your email to confirm your account before signing in.'
      : 'Your account has been created.',
  };
}

export async function signInWithSupabase({ email, password } = {}) {
  const client = ensureSupabaseAuthReady();
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanPassword = typeof password === 'string' ? password.trim() : '';

  if (!cleanEmail || !cleanPassword) {
    throw new Error('Please enter your email and password.');
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPassword,
  });

  if (error) {
    throw new Error(getCleanErrorMessage(error, 'Invalid email or password.'));
  }

  const authUser = data.user ?? null;
  if (!authUser) {
    throw new Error('Unable to sign in right now.');
  }

  const existingProfile = await getProfile(authUser.id);
  const profile =
    existingProfile ??
    (await insertSupabaseProfile(authUser.id, {
      firstName: authUser.user_metadata?.first_name ?? '',
      lastName: authUser.user_metadata?.last_name ?? '',
      email: authUser.email ?? cleanEmail,
      phone: '',
      role: 'customer',
      defaultShippingAddress: {},
    }, data.session?.access_token));

  return {
    user: authUser,
    session: data.session ?? null,
    profile,
  };
}

export async function signOutWithSupabase() {
  const client = ensureSupabaseAuthReady();
  const { error } = await client.auth.signOut();

  if (error) {
    throw new Error(getCleanErrorMessage(error, 'Unable to sign out right now.'));
  }

  return true;
}

export async function getCurrentSupabaseUser() {
  const client = ensureSupabaseAuthReady();
  const { data, error } = await client.auth.getUser();

  if (error) {
    const cleanMessage = getCleanErrorMessage(error, '');
    if (cleanMessage && cleanMessage !== 'Auth session missing!') {
      throw new Error(cleanMessage);
    }
  }

  return data?.user ?? null;
}

export async function getProfile(userId) {
  const cleanUserId = typeof userId === 'string' ? userId.trim() : '';

  if (!cleanUserId) {
    return null;
  }

  const rows = await requestProfiles(`?id=eq.${encodeURIComponent(cleanUserId)}&select=*`);
  return normalizeProfileFromSupabase(Array.isArray(rows) ? rows[0] : rows);
}

export async function upsertProfile(userId, profileData = {}, payloadOptions = {}) {
  return upsertSupabaseProfile(userId, profileData, undefined, payloadOptions);
}
