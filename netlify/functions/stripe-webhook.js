import Stripe from 'stripe';
import { createSupabaseAdminClient, getRequiredEnv, jsonResponse } from './_shared.js';

function getRawBody(event) {
  if (!event?.body) {
    return '';
  }

  if (event.isBase64Encoded) {
    return Buffer.from(event.body, 'base64').toString('utf8');
  }

  return event.body;
}

function getStripeSignature(event) {
  return (
    event?.headers?.['stripe-signature'] ||
    event?.headers?.['Stripe-Signature'] ||
    event?.headers?.['Stripe-signature'] ||
    ''
  );
}

function parseIsoTimestamp(seconds) {
  if (!seconds) return null;
  const date = new Date(Number(seconds) * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function resolveOrderRecord(supabase, { orderId, sessionId, paymentIntentId }) {
  if (orderId) {
    const { data } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
    if (data) return data;
  }

  if (sessionId) {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_checkout_session_id', sessionId)
      .maybeSingle();
    if (data) return data;
  }

  if (paymentIntentId) {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle();
    if (data) return data;
  }

  return null;
}

async function updateOrderPaymentState(supabase, order, updates) {
  if (!order?.id) {
    return null;
  }

  const currentStatus = typeof order.payment_status === 'string' ? order.payment_status.toLowerCase() : '';
  const nextStatus = typeof updates.payment_status === 'string' ? updates.payment_status.toLowerCase() : currentStatus;
  if (currentStatus === 'paid' && nextStatus !== 'paid') {
    return order;
  }

  const payload = {
    payment_provider: 'stripe',
    stripe_checkout_session_id: updates.stripe_checkout_session_id ?? order.stripe_checkout_session_id ?? null,
    stripe_payment_intent_id: updates.stripe_payment_intent_id ?? order.stripe_payment_intent_id ?? null,
    payment_status: updates.payment_status ?? order.payment_status ?? 'pending',
    paid_at: updates.paid_at ?? order.paid_at ?? null,
  };

  const { error } = await supabase.from('orders').update(payload).eq('id', order.id);
  if (error) {
    throw error;
  }

  return { ...order, ...payload };
}

function extractIdsFromEventObject(eventType, object) {
  const metadata = object?.metadata ?? {};
  const orderId =
    typeof metadata.order_id === 'string' && metadata.order_id.trim()
      ? metadata.order_id
      : typeof object?.client_reference_id === 'string'
        ? object.client_reference_id
        : '';
  const sessionId =
    typeof object?.id === 'string' && eventType.startsWith('checkout.session')
      ? object.id
      : typeof object?.checkout_session === 'string'
        ? object.checkout_session
        : typeof object?.checkout_session_id === 'string'
          ? object.checkout_session_id
          : '';
  const paymentIntentId =
    typeof object?.payment_intent === 'string'
      ? object.payment_intent
      : typeof object?.id === 'string' && eventType.startsWith('payment_intent')
        ? object.id
        : '';

  return { orderId, sessionId, paymentIntentId };
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' });
  }

  try {
    const stripeSecretKey = getRequiredEnv('STRIPE_SECRET_KEY');
    const webhookSecret = getRequiredEnv('STRIPE_WEBHOOK_SECRET');
    const supabase = createSupabaseAdminClient();
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    });

    const signature = getStripeSignature(event);
    if (!signature) {
      return jsonResponse(400, { error: 'Missing Stripe signature.' });
    }

    const rawBody = getRawBody(event);
    const stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    let resolvedOrder = null;
    const eventObject = stripeEvent.data?.object ?? {};
    const ids = extractIdsFromEventObject(stripeEvent.type, eventObject);

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const paymentStatus = eventObject.payment_status === 'paid' ? 'paid' : 'pending';
        resolvedOrder = await resolveOrderRecord(supabase, ids);
        if (!resolvedOrder) break;

        resolvedOrder = await updateOrderPaymentState(supabase, resolvedOrder, {
          payment_status: paymentStatus,
          paid_at: paymentStatus === 'paid' ? parseIsoTimestamp(stripeEvent.created) : null,
          stripe_checkout_session_id: eventObject.id ?? ids.sessionId ?? resolvedOrder.stripe_checkout_session_id,
          stripe_payment_intent_id:
            typeof eventObject.payment_intent === 'string'
              ? eventObject.payment_intent
              : resolvedOrder.stripe_payment_intent_id,
        });
        break;
      }

      case 'payment_intent.succeeded': {
        resolvedOrder = await resolveOrderRecord(supabase, ids);
        if (!resolvedOrder) break;

        resolvedOrder = await updateOrderPaymentState(supabase, resolvedOrder, {
          payment_status: 'paid',
          paid_at: parseIsoTimestamp(stripeEvent.created),
          stripe_payment_intent_id: eventObject.id ?? ids.paymentIntentId ?? resolvedOrder.stripe_payment_intent_id,
          stripe_checkout_session_id:
            typeof eventObject.metadata?.checkout_session_id === 'string'
              ? eventObject.metadata.checkout_session_id
              : resolvedOrder.stripe_checkout_session_id,
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        resolvedOrder = await resolveOrderRecord(supabase, ids);
        if (!resolvedOrder) break;

        resolvedOrder = await updateOrderPaymentState(supabase, resolvedOrder, {
          payment_status: 'failed',
          paid_at: null,
          stripe_payment_intent_id: eventObject.id ?? ids.paymentIntentId ?? resolvedOrder.stripe_payment_intent_id,
          stripe_checkout_session_id:
            typeof eventObject.metadata?.checkout_session_id === 'string'
              ? eventObject.metadata.checkout_session_id
              : resolvedOrder.stripe_checkout_session_id,
        });
        break;
      }

      case 'checkout.session.expired': {
        resolvedOrder = await resolveOrderRecord(supabase, ids);
        if (!resolvedOrder) break;

        resolvedOrder = await updateOrderPaymentState(supabase, resolvedOrder, {
          payment_status: 'expired',
          paid_at: null,
          stripe_checkout_session_id: eventObject.id ?? ids.sessionId ?? resolvedOrder.stripe_checkout_session_id,
          stripe_payment_intent_id:
            typeof eventObject.payment_intent === 'string'
              ? eventObject.payment_intent
              : resolvedOrder.stripe_payment_intent_id,
        });
        break;
      }

      default:
        break;
    }

    return jsonResponse(200, {
      received: true,
      type: stripeEvent.type,
      orderId: resolvedOrder?.id ?? ids.orderId ?? null,
    });
  } catch (error) {
    console.warn('ShopOra Stripe webhook failed.', error);
    return jsonResponse(400, {
      error:
        error instanceof Error && error.message.trim()
          ? error.message
          : 'Stripe webhook could not be processed.',
    });
  }
}
