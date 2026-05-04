import { createClient } from '@supabase/supabase-js';

export function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createSupabaseAdminClient() {
  const url = getRequiredEnv('SUPABASE_URL');
  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getSiteUrl(event) {
  const baseUrl =
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    event?.headers?.origin ||
    'http://localhost:4173';

  return String(baseUrl).replace(/\/$/, '');
}

export function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

export function getRequestBody(event) {
  if (!event?.body) return {};

  if (event.isBase64Encoded) {
    const decoded = Buffer.from(event.body, 'base64').toString('utf8');
    return JSON.parse(decoded || '{}');
  }

  return JSON.parse(event.body);
}

export function getBearerToken(event) {
  const header = event?.headers?.authorization || event?.headers?.Authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}
