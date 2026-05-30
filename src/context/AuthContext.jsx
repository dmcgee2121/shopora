import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import {
  getCurrentSupabaseUser,
  getProfile,
  signInWithSupabase,
  signOutWithSupabase,
  signUpWithSupabase,
  upsertProfile,
} from '../services/supabaseAuthService';
import {
  getSavedProductIdsForCurrentSupabaseUser,
  toggleSavedProductId,
} from '../services/supabaseSavedItemsService';
import { idsMatch, normalizeId } from '../utils/idUtils';
import { isDemoAdminEnabled } from '../utils/runtimeMode';

const AuthContext = createContext(null);
const USERS_KEY = 'shopora_users';
const SESSION_KEY = 'shopora_current_user';
const DEMO_ADMIN_EMAIL = 'admin@shopora.demo';

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function removeJson(key) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

function normalizeAddress(address) {
  return address && typeof address === 'object' && !Array.isArray(address) ? address : {};
}

function normalizeSavedProductIds(savedProductIds) {
  return Array.isArray(savedProductIds) ? savedProductIds.map(normalizeId).filter(Boolean) : [];
}

function normalizeStoredUser(user) {
  const safeUser = user && typeof user === 'object' ? user : {};
  return {
    ...safeUser,
    id: normalizeId(safeUser.id),
    email: typeof safeUser.email === 'string' ? safeUser.email : '',
    firstName: typeof safeUser.firstName === 'string' ? safeUser.firstName : '',
    lastName: typeof safeUser.lastName === 'string' ? safeUser.lastName : '',
    phone: typeof safeUser.phone === 'string' ? safeUser.phone : '',
    role: safeUser.role === 'admin' ? 'admin' : 'customer',
    password: typeof safeUser.password === 'string' ? safeUser.password : undefined,
    createdAt: typeof safeUser.createdAt === 'string' ? safeUser.createdAt : new Date().toISOString(),
    defaultShippingAddress: normalizeAddress(safeUser.defaultShippingAddress),
    savedProductIds: normalizeSavedProductIds(safeUser.savedProductIds),
  };
}

function createDemoAdmin() {
  return normalizeStoredUser({
    id: 'user-shopora-admin',
    firstName: 'ShopOra',
    lastName: 'Admin',
    email: DEMO_ADMIN_EMAIL,
    password: 'Admin123!',
    phone: '',
    createdAt: new Date().toISOString(),
    role: 'admin',
    defaultShippingAddress: {
      firstName: 'ShopOra',
      lastName: 'Admin',
      street: '',
      city: '',
      state: '',
      zip: '',
    },
    savedProductIds: [],
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createUserId(email) {
  return `user-${email.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function isDemoAdminEmail(email) {
  return email.trim().toLowerCase() === DEMO_ADMIN_EMAIL;
}

function readStoredUsers() {
  const storedUsers = readJson(USERS_KEY, []).map(normalizeStoredUser);
  const usersWithoutDemoAdmin = storedUsers.filter((user) => user.email.toLowerCase() !== DEMO_ADMIN_EMAIL);

  if (!isDemoAdminEnabled) {
    if (usersWithoutDemoAdmin.length !== storedUsers.length) {
      writeJson(USERS_KEY, usersWithoutDemoAdmin);
    }
    return usersWithoutDemoAdmin;
  }

  const hasDemoAdmin = storedUsers.some((user) => user.email.toLowerCase() === DEMO_ADMIN_EMAIL);
  const nextUsers = hasDemoAdmin ? storedUsers : [...storedUsers, createDemoAdmin()];
  if (!hasDemoAdmin) {
    writeJson(USERS_KEY, nextUsers);
  }
  return nextUsers;
}

function getLocalSessionUser(users) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const currentUserId = normalizeId(parsed?.userId);
    if (!currentUserId) return null;
    return users.find((user) => idsMatch(user.id, currentUserId)) ?? null;
  } catch {
    return null;
  }
}

function mergeDefaultShippingAddress(currentUser, updates) {
  return {
    ...(currentUser.defaultShippingAddress ?? {}),
    ...(updates.defaultShippingAddress ?? {}),
  };
}

function sanitizeShippingAddressForSupabase(address) {
  const safeAddress = normalizeAddress(address);
  return {
    street: typeof safeAddress.street === 'string' ? safeAddress.street : '',
    city: typeof safeAddress.city === 'string' ? safeAddress.city : '',
    state: typeof safeAddress.state === 'string' ? safeAddress.state : '',
    zip: typeof safeAddress.zip === 'string' ? safeAddress.zip : '',
  };
}

function mergeUserRecord(existingUser, updatedUser, { preservePassword = true } = {}) {
  const safeExistingUser = existingUser && typeof existingUser === 'object' ? existingUser : {};
  const safeUpdatedUser = updatedUser && typeof updatedUser === 'object' ? updatedUser : {};
  const nextUser = normalizeStoredUser({
    ...safeExistingUser,
    ...safeUpdatedUser,
    password: typeof safeUpdatedUser.password === 'string'
      ? safeUpdatedUser.password
      : preservePassword && typeof safeExistingUser?.password === 'string'
        ? safeExistingUser.password
        : undefined,
    defaultShippingAddress: mergeDefaultShippingAddress(safeExistingUser, safeUpdatedUser),
    savedProductIds: Array.isArray(safeUpdatedUser.savedProductIds)
      ? safeUpdatedUser.savedProductIds
      : safeExistingUser?.savedProductIds ?? [],
  });

  if (!nextUser.email && safeExistingUser?.email) {
    nextUser.email = safeExistingUser.email;
  }

  return nextUser;
}

function mergeUsers(users, nextUser, { preservePassword = true } = {}) {
  if (!nextUser || typeof nextUser !== 'object') {
    return users;
  }

  const normalizedNextUser = normalizeStoredUser({
    ...nextUser,
    password: preservePassword ? nextUser.password : undefined,
  });

  const existingIndex = users.findIndex((user) => idsMatch(user.id, normalizedNextUser.id));
  if (existingIndex === -1) {
    return [...users, normalizedNextUser];
  }

  const existingUser = users[existingIndex];
  const mergedUser = mergeUserRecord(existingUser, {
    ...normalizedNextUser,
    password: preservePassword ? normalizedNextUser.password : undefined,
  }, { preservePassword });

  return users.map((user, index) => (index === existingIndex ? mergedUser : user));
}

function normalizeSupabaseProfileToUser(profile, fallbackUser = {}) {
  const safeFallbackUser = fallbackUser && typeof fallbackUser === 'object' ? fallbackUser : {};
  const { password: _password, ...fallbackWithoutPassword } = safeFallbackUser;
  const normalizedFallback = normalizeStoredUser({
    ...fallbackWithoutPassword,
    role: safeFallbackUser.role === 'admin' ? 'admin' : 'customer',
    savedProductIds: normalizeSavedProductIds(safeFallbackUser.savedProductIds),
  });

  if (!profile || typeof profile !== 'object') {
    return normalizedFallback;
  }

  return normalizeStoredUser({
    ...normalizedFallback,
    id: profile.id,
    firstName: profile.firstName ?? normalizedFallback.firstName ?? '',
    lastName: profile.lastName ?? normalizedFallback.lastName ?? '',
    email: profile.email ?? normalizedFallback.email ?? '',
    phone: profile.phone ?? normalizedFallback.phone ?? '',
    role: profile.role === 'admin' ? 'admin' : 'customer',
    createdAt: profile.createdAt ?? normalizedFallback.createdAt ?? new Date().toISOString(),
    defaultShippingAddress: normalizeAddress(profile.defaultShippingAddress ?? normalizedFallback.defaultShippingAddress),
    savedProductIds: normalizeSavedProductIds(normalizedFallback.savedProductIds),
  });
}

function getFriendlyAuthError(error, fallbackMessage) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallbackMessage;
}

function shouldFallbackToLocalAuth(error) {
  const message = getFriendlyAuthError(error, '').toLowerCase();
  return (
    message.includes('not configured') ||
    message.includes('unavailable') ||
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('failed to fetch')
  );
}

function getProfileWriteErrorMessage(error, fallbackMessage) {
  const message = getFriendlyAuthError(error, fallbackMessage);
  const lower = message.toLowerCase();

  if (lower.includes('permission denied for table profiles') || lower.includes('grant update on public.profiles')) {
    return 'ShopOra could not save this profile because the live Supabase profiles table is missing the required UPDATE permission. Re-run supabase/schema.sql.';
  }

  return message;
}

function getSavedItemsErrorMessage(error, fallbackMessage) {
  const message = getFriendlyAuthError(error, fallbackMessage);
  const lower = message.toLowerCase();

  if (
    lower.includes('permission denied for table saved_items') ||
    lower.includes('row-level security') ||
    lower.includes('violates row-level security')
  ) {
    return 'ShopOra could not load or update your saved items because the live Supabase saved_items table is missing the required permissions. Re-run supabase/schema.sql.';
  }

  return message;
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const initialUsers = readStoredUsers();
    return initialUsers;
  });
  const [currentUser, setCurrentUser] = useState(() => getLocalSessionUser(readStoredUsers()));
  const [authSource, setAuthSource] = useState(() => {
    if (currentUser) return 'local';
    return isSupabaseConfigured ? 'supabase' : 'local';
  });
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(isSupabaseConfigured));
  const [authError, setAuthError] = useState('');
  const [savedItemRequestIds, setSavedItemRequestIds] = useState([]);

  const loadSupabaseSavedProductIds = async (fallbackMessage) => {
    try {
      return {
        savedProductIds: await getSavedProductIdsForCurrentSupabaseUser(),
        hadError: false,
      };
    } catch (error) {
      console.warn('ShopOra could not hydrate saved items from Supabase.', error);
      setAuthError(
        getSavedItemsErrorMessage(
          error,
          fallbackMessage ?? 'Unable to load your saved items right now.',
        ),
      );
      return {
        savedProductIds: [],
        hadError: true,
      };
    }
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      if (!isSupabaseConfigured) {
        const storedUsers = readStoredUsers();
        const localUser = getLocalSessionUser(storedUsers);
        if (cancelled) return;
        setUsers(storedUsers);
        setCurrentUser(localUser);
        setAuthSource('local');
        setIsAuthLoading(false);
        return;
      }

      const storedUsers = readStoredUsers();
      const localUser = getLocalSessionUser(storedUsers);
      if (localUser?.role === 'admin') {
        if (cancelled) return;
        setUsers(storedUsers);
        setCurrentUser(localUser);
        setAuthSource('local');
        setIsAuthLoading(false);
        return;
      }

      try {
        const supabaseUser = await getCurrentSupabaseUser();
        if (cancelled) return;

        if (supabaseUser) {
          const profile = await getProfile(supabaseUser.id);
          const { savedProductIds, hadError: savedItemsError } = await loadSupabaseSavedProductIds(
            'Unable to load your saved items right now.',
          );
          if (cancelled) return;
          const nextUser = normalizeSupabaseProfileToUser(profile, {
            id: supabaseUser.id,
            email: supabaseUser.email ?? '',
            firstName: supabaseUser.user_metadata?.first_name ?? supabaseUser.user_metadata?.firstName ?? '',
            lastName: supabaseUser.user_metadata?.last_name ?? supabaseUser.user_metadata?.lastName ?? '',
            createdAt: profile?.createdAt ?? new Date().toISOString(),
            savedProductIds,
          });
          if (!nextUser || !nextUser.id) {
            throw new Error('Unable to prepare your account right now.');
          }
          const nextUsers = mergeUsers(storedUsers, nextUser, { preservePassword: false });
          if (cancelled) return;
          setUsers(nextUsers);
          writeJson(USERS_KEY, nextUsers);
          setCurrentUser(nextUser);
          setAuthSource('supabase');
          if (!savedItemsError) {
            setAuthError('');
          }
          setIsAuthLoading(false);
          return;
        }

        if (localUser) {
          setUsers(storedUsers);
          setCurrentUser(localUser);
          setAuthSource('local');
          setAuthError('');
          setIsAuthLoading(false);
          return;
        }
      } catch (error) {
        if (cancelled) return;
        if (localUser) {
          setUsers(storedUsers);
          setCurrentUser(localUser);
          setAuthSource('local');
          setAuthError('');
          setIsAuthLoading(false);
          return;
        }

        setAuthError(getFriendlyAuthError(error, 'Unable to load your sign-in state right now.'));
      }

      if (cancelled) return;
      setUsers(storedUsers);
      setCurrentUser(null);
      setAuthSource('supabase');
      setIsAuthLoading(false);
    };

    bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const syncCurrentUser = (nextUser, { source, preservePassword = true } = {}) => {
    const nextUsers = mergeUsers(users, nextUser, { preservePassword });
    setUsers(nextUsers);
    writeJson(USERS_KEY, nextUsers);
    setCurrentUser(nextUser);
    setAuthSource(source ?? authSource);

    if (source === 'local') {
      writeJson(SESSION_KEY, { userId: nextUser.id });
    } else {
      removeJson(SESSION_KEY);
    }

    return nextUser;
  };

  const registerLocal = async ({ firstName, lastName, email, password }) => {
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const storedUsers = readStoredUsers();

    if (!cleanFirstName || !cleanLastName || !cleanEmail || !cleanPassword) {
      throw new Error('Please complete all required fields.');
    }

    if (!isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    if (isDemoAdminEmail(cleanEmail)) {
      throw new Error('Use the demo admin login for ShopOra admin access.');
    }

    const duplicate = storedUsers.some((user) => user.email.toLowerCase() === cleanEmail);
    if (duplicate) {
      throw new Error('An account with that email already exists.');
    }

    const newUser = normalizeStoredUser({
      id: createUserId(cleanEmail),
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      password: cleanPassword,
      phone: '',
      createdAt: new Date().toISOString(),
      role: 'customer',
      defaultShippingAddress: {
        firstName: cleanFirstName,
        lastName: cleanLastName,
        street: '',
        city: '',
        state: '',
        zip: '',
      },
      savedProductIds: [],
    });

    syncCurrentUser(newUser, { source: 'local', preservePassword: true });
    setAuthError('');
    return {
      user: newUser,
      needsEmailConfirmation: false,
      message: 'Your account has been created.',
    };
  };

  const register = async ({ firstName, lastName, email, password }) => {
    if (isDemoAdminEmail(email)) {
      if (isDemoAdminEnabled) {
        throw new Error('Use the demo admin login for ShopOra admin access.');
      }
      throw new Error('This reserved demo admin email is disabled in this runtime mode.');
    }

    if (isSupabaseConfigured) {
      try {
        const result = await signUpWithSupabase({ firstName, lastName, email, password });
        const shouldLoadSavedItems = Boolean(result.session?.access_token && result.user);
        const { savedProductIds, hadError: savedItemsError } = shouldLoadSavedItems
          ? await loadSupabaseSavedProductIds('Unable to load your saved items right now.')
          : { savedProductIds: [], hadError: false };
        const nextUser =
          normalizeSupabaseProfileToUser(result.profile, {
            id: result.user?.id,
            email: result.user?.email ?? email.trim().toLowerCase(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            createdAt: result.profile?.createdAt ?? new Date().toISOString(),
            savedProductIds,
          }) ?? null;

        if (nextUser?.id) {
          syncCurrentUser(nextUser, { source: 'supabase', preservePassword: false });
        } else {
          console.warn('ShopOra skipped syncing a Supabase account because the profile payload was incomplete.');
        }

        if (!savedItemsError) {
          setAuthError('');
        }
        return {
          user: nextUser,
          needsEmailConfirmation: result.needsEmailConfirmation,
          message: result.message,
        };
      } catch (error) {
        if (!shouldFallbackToLocalAuth(error)) {
          throw error instanceof Error ? error : new Error('Unable to create your account right now.');
        }
      }
    }

    return registerLocal({ firstName, lastName, email, password });
  };

  const loginLocal = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const storedUsers = readStoredUsers();
    const availableUsers = storedUsers.length ? storedUsers : users;

    if (!cleanEmail || !cleanPassword) {
      throw new Error('Please enter your email and password.');
    }

    const matchedUser = availableUsers.find(
      (user) => user.email.toLowerCase() === cleanEmail && user.password === cleanPassword,
    );

    if (!matchedUser) {
      throw new Error('Invalid email or password.');
    }

    const normalized = normalizeStoredUser(matchedUser);
    syncCurrentUser(normalized, { source: 'local', preservePassword: true });
    setAuthError('');
    return normalized;
  };

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    if (isDemoAdminEmail(cleanEmail)) {
      if (!isDemoAdminEnabled) {
        throw new Error('Demo admin sign-in is disabled in this runtime mode.');
      }
      return loginLocal(email, password);
    }

    if (isSupabaseConfigured) {
      try {
        const result = await signInWithSupabase({ email, password });
        const { savedProductIds, hadError: savedItemsError } = await loadSupabaseSavedProductIds(
          'Unable to load your saved items right now.',
        );
        const profileUser =
          normalizeSupabaseProfileToUser(result.profile, {
            id: result.user?.id,
            email: result.user?.email ?? cleanEmail,
            firstName: result.user?.user_metadata?.first_name ?? result.user?.user_metadata?.firstName ?? '',
            lastName: result.user?.user_metadata?.last_name ?? result.user?.user_metadata?.lastName ?? '',
            createdAt: result.profile?.createdAt ?? new Date().toISOString(),
            savedProductIds,
          }) ?? null;

        if (profileUser?.id) {
          syncCurrentUser(profileUser, { source: 'supabase', preservePassword: false });
        } else {
          console.warn('ShopOra skipped syncing a Supabase login because the profile payload was incomplete.');
        }

        if (!savedItemsError) {
          setAuthError('');
        }
        return profileUser;
      } catch (error) {
        if (!shouldFallbackToLocalAuth(error)) {
          throw error instanceof Error ? error : new Error('Unable to sign in right now.');
        }
      }
    }

    return loginLocal(email, password);
  };

  const logout = async () => {
    const source = authSource;
    setCurrentUser(null);
    setAuthSource(isSupabaseConfigured ? 'supabase' : 'local');
    removeJson(SESSION_KEY);
    setAuthError('');

    if (source === 'supabase') {
      try {
        await signOutWithSupabase();
      } catch (error) {
        setAuthError(getFriendlyAuthError(error, 'Unable to sign out right now.'));
      }
    }
  };

  const updateProfile = async (updates) => {
    if (!currentUser) {
      throw new Error('You must be signed in to update your profile.');
    }

    const nextUser = normalizeStoredUser({
      ...currentUser,
      ...updates,
      role: currentUser.role,
      defaultShippingAddress: mergeDefaultShippingAddress(currentUser, updates),
    });

    if (authSource === 'supabase') {
      try {
        const profile = await upsertProfile(currentUser.id, {
          firstName: nextUser.firstName,
          lastName: nextUser.lastName,
          phone: nextUser.phone,
          defaultShippingAddress: sanitizeShippingAddressForSupabase(nextUser.defaultShippingAddress),
        }, {
          includeEmail: false,
          includeRole: false,
        });

        const profileUser =
          normalizeSupabaseProfileToUser(profile, {
            ...nextUser,
            savedProductIds: currentUser.savedProductIds ?? [],
          }) ?? nextUser;

        if (profileUser?.id) {
          syncCurrentUser(profileUser, { source: 'supabase', preservePassword: false });
        } else {
          console.warn('ShopOra skipped syncing a Supabase profile update because the payload was incomplete.');
        }
        setAuthError('');
        return profileUser;
      } catch (error) {
        if (!shouldFallbackToLocalAuth(error)) {
          throw new Error(getProfileWriteErrorMessage(error, 'Unable to update your profile right now.'));
        }
      }
    }

    syncCurrentUser(nextUser, { source: 'local', preservePassword: true });
    setAuthError('');
    return nextUser;
  };

  const toggleSavedItem = async (product) => {
    if (!currentUser) return false;

    const productId = normalizeId(typeof product === 'string' ? product : product?.id);
    if (!productId) {
      setAuthError('Please choose a valid product before saving it.');
      return false;
    }

    const savedProductIds = currentUser.savedProductIds ?? [];
    const isSaved = savedProductIds.some((id) => idsMatch(id, productId));

    if (authSource === 'supabase') {
      setSavedItemRequestIds((current) =>
        current.some((id) => idsMatch(id, productId)) ? current : [...current, productId],
      );

      try {
        const updatedSavedProductIds = await toggleSavedProductId(productId, savedProductIds);
        const nextUser = normalizeStoredUser({
          ...currentUser,
          savedProductIds: updatedSavedProductIds,
        });

        if (nextUser?.id) {
          syncCurrentUser(nextUser, {
            source: 'supabase',
            preservePassword: false,
          });
        }
        setAuthError('');
        return !isSaved;
      } catch (error) {
        setAuthError(getSavedItemsErrorMessage(error, 'Unable to update your saved items right now.'));
        return isSaved;
      } finally {
        setSavedItemRequestIds((current) => current.filter((id) => !idsMatch(id, productId)));
      }
    }

    const nextSavedProductIds = isSaved
      ? savedProductIds.filter((id) => !idsMatch(id, productId))
      : [...savedProductIds, productId];

    const nextUser = normalizeStoredUser({
      ...currentUser,
      savedProductIds: nextSavedProductIds,
    });

    syncCurrentUser(nextUser, {
      source: 'local',
      preservePassword: true,
    });
    setAuthError('');
    return !isSaved;
  };

  const value = useMemo(() => {
    const savedProductIds = Array.isArray(currentUser?.savedProductIds) ? currentUser.savedProductIds : [];

    return {
      users,
      currentUser,
      authSource,
      isAuthLoading,
      authError,
      isSavingSavedItem: (productId) =>
        savedItemRequestIds.some((id) => idsMatch(id, productId)),
      isAuthenticated: Boolean(currentUser),
      isAdmin: currentUser?.role === 'admin',
      savedProductIds,
      register,
      login,
      logout,
      updateProfile,
      toggleSavedItem,
      isSavedItem: (productId) => savedProductIds.some((id) => idsMatch(id, productId)),
    };
  }, [users, currentUser, authSource, isAuthLoading, authError, savedItemRequestIds]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
