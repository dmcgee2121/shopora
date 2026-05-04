import Stripe from 'stripe';
import { createSupabaseAdminClient, getBearerToken, getRequestBody, getRequiredEnv, getSiteUrl, jsonResponse } from './_shared.js';

const INVALID_REQUEST_MESSAGE = 'Invalid checkout request.';

function toMinorUnits(amount) {
  const numeric = Number(amount ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.round(numeric * 100));
}

function normalizeCurrency(currency) {
  const clean = typeof currency === 'string' ? currency.trim().toLowerCase() : '';
  return clean || 'usd';
}

function buildLineItemDescription(item) {
  const parts = [];
  if (item.product_brand) parts.push(item.product_brand);
  if (item.sku) parts.push(`SKU ${item.sku}`);
  if (item.selected_size) parts.push(`Size ${item.selected_size}`);
  if (item.selected_color) parts.push(item.selected_color);
  return parts.length ? parts.join(' | ') : undefined;
}

function buildStripeLineItems(order, orderItems) {
  const lineItems = [];
  const currency = normalizeCurrency(order.currency);

  for (const item of orderItems) {
    const quantity = Math.max(1, Number(item.quantity ?? 1));
    const unitAmount = toMinorUnits(item.unit_price);
    if (!item.product_name || unitAmount <= 0) {
      continue;
    }

    lineItems.push({
      quantity,
      price_data: {
        currency,
        unit_amount: unitAmount,
        product_data: {
          name: item.product_name,
          description: buildLineItemDescription(item),
        },
      },
    });
  }

  const shippingAmount = toMinorUnits(order.shipping);
  if (shippingAmount > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency,
        unit_amount: shippingAmount,
        product_data: {
          name: 'Shipping',
        },
      },
    });
  }

  const taxAmount = toMinorUnits(order.tax);
  if (taxAmount > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency,
        unit_amount: taxAmount,
        product_data: {
          name: 'Sales tax',
        },
      },
    });
  }

  if (!lineItems.length) {
    throw new Error('The order has no billable items.');
  }

  return lineItems;
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' });
  }

  try {
    const stripeSecretKey = getRequiredEnv('STRIPE_SECRET_KEY');
    const supabase = createSupabaseAdminClient();
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    });

    const body = getRequestBody(event);
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    const accessToken = getBearerToken(event);

    if (!orderId) {
      return jsonResponse(400, { error: INVALID_REQUEST_MESSAGE });
    }

    if (!accessToken) {
      return jsonResponse(401, { error: 'Missing Supabase access token.' });
    }

    const { data: authUser, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !authUser?.user?.id) {
      return jsonResponse(401, { error: 'Unable to verify your Supabase session.' });
    }

    const userId = authUser.user.id;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return jsonResponse(404, { error: 'Order not found.' });
    }

    if (order.user_id !== userId) {
      return jsonResponse(403, { error: 'You can only start Stripe Checkout for your own order.' });
    }

    if (typeof order.payment_status === 'string' && order.payment_status.toLowerCase() === 'paid') {
      return jsonResponse(200, {
        url: `${getSiteUrl(event)}/order-confirmation/${order.id}`,
        orderId: order.id,
        sessionId: null,
        alreadyPaid: true,
      });
    }

    let session = null;
    if (order.stripe_checkout_session_id) {
      try {
        const existing = await stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id);
        if (existing && existing.url && existing.status === 'open') {
          session = existing;
        }
      } catch {
        session = null;
      }
    }

    if (!session) {
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: true });

      if (itemsError) {
        return jsonResponse(500, { error: 'Unable to load order items for Stripe Checkout.' });
      }

      const lineItems = buildStripeLineItems(order, Array.isArray(orderItems) ? orderItems : []);
      const siteUrl = getSiteUrl(event);

      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        client_reference_id: order.id,
        customer_email: order.customer_email || authUser.user.email || undefined,
        allow_promotion_codes: false,
        billing_address_collection: 'auto',
        success_url: `${siteUrl}/order-confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}&stripe=success`,
        cancel_url: `${siteUrl}/cart?stripe=cancelled&orderId=${order.id}`,
        metadata: {
          order_id: order.id,
          user_id: order.user_id,
          order_number: order.order_number ?? '',
          payment_provider: 'stripe',
        },
        payment_intent_data: {
          metadata: {
            order_id: order.id,
            user_id: order.user_id,
            order_number: order.order_number ?? '',
            payment_provider: 'stripe',
          },
        },
        line_items: lineItems,
      });
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        stripe_checkout_session_id: session.id,
        payment_provider: 'stripe',
        payment_status: 'pending',
      })
      .eq('id', order.id);

    if (updateError) {
      console.warn('ShopOra could not persist the Stripe checkout session id.', updateError);
    }

    return jsonResponse(200, {
      url: session.url,
      sessionId: session.id,
      orderId: order.id,
      paymentStatus: 'pending',
      paymentProvider: 'stripe',
    });
  } catch (error) {
    console.warn('ShopOra could not create a Stripe Checkout Session.', error);
    return jsonResponse(500, {
      error:
        error instanceof Error && error.message.trim()
          ? error.message
          : 'ShopOra could not start Stripe Checkout right now.',
    });
  }
}
