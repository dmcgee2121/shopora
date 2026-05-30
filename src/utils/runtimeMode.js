const ALLOWED_RUNTIME_MODES = new Set(['demo', 'pilot', 'production']);

function normalizeMode(value) {
  const candidate = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return ALLOWED_RUNTIME_MODES.has(candidate) ? candidate : 'demo';
}

function parseOptionalBoolean(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return null;
}

export const SHOPORA_RUNTIME_MODE = normalizeMode(import.meta.env.VITE_SHOPORA_RUNTIME_MODE);
export const isProductionRuntime = SHOPORA_RUNTIME_MODE === 'production';
export const isDemoRuntime = SHOPORA_RUNTIME_MODE === 'demo';

const explicitDemoAdminFlag = parseOptionalBoolean(import.meta.env.VITE_SHOPORA_ENABLE_DEMO_ADMIN);

export const isDemoAdminEnabled =
  explicitDemoAdminFlag !== null ? explicitDemoAdminFlag : !isProductionRuntime;

export function getRuntimeModeLabel() {
  switch (SHOPORA_RUNTIME_MODE) {
    case 'production':
      return 'Production';
    case 'pilot':
      return 'Pilot';
    default:
      return 'Demo';
  }
}

