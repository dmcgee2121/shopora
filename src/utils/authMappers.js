import { normalizeId } from './idUtils.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeRole(role) {
  return role === 'admin' ? 'admin' : 'customer';
}

function normalizeAddress(address) {
  return address && typeof address === 'object' && !Array.isArray(address) ? address : {};
}

function toNullableString(value) {
  if (typeof value !== 'string') return value ?? null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function getProfileId(user) {
  const id = normalizeId(user?.supabaseId ?? user?.id);
  return UUID_PATTERN.test(id) ? id : null;
}

export function normalizeProfileFromSupabase(profile) {
  if (!profile) return null;

  return {
    id: normalizeId(profile.id),
    firstName: profile.first_name ?? '',
    lastName: profile.last_name ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? '',
    role: normalizeRole(profile.role),
    defaultShippingAddress: normalizeAddress(profile.default_shipping_address),
    createdAt: profile.created_at ?? null,
    updatedAt: profile.updated_at ?? null,
  };
}

export function profileToSupabasePayload(user, { includeEmail = true, includeRole = true } = {}) {
  if (!user) return null;

  const id = getProfileId(user);
  const payload = {
    first_name: toNullableString(user.firstName ?? user.first_name),
    last_name: toNullableString(user.lastName ?? user.last_name),
    phone: toNullableString(user.phone),
    default_shipping_address: normalizeAddress(user.defaultShippingAddress ?? user.default_shipping_address),
  };

  if (includeEmail) {
    payload.email = toNullableString(user.email);
  }

  if (includeRole) {
    payload.role = normalizeRole(user.role);
  }

  return id ? { id, ...payload } : payload;
}

export function getDisplayName(userOrProfile) {
  if (!userOrProfile) return 'ShopOra Customer';

  const firstName = userOrProfile.firstName ?? userOrProfile.first_name ?? '';
  const lastName = userOrProfile.lastName ?? userOrProfile.last_name ?? '';
  const fullName = [firstName, lastName].map((part) => String(part).trim()).filter(Boolean).join(' ');

  return fullName || userOrProfile.email || 'ShopOra Customer';
}

export function isAdminProfile(profile) {
  return normalizeRole(profile?.role) === 'admin';
}
