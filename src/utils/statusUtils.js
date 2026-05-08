export function normalizeStatusValue(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function normalizeOrderStatusValue(value) {
  switch (normalizeStatusValue(value)) {
    case 'pending':
      return 'pending';
    case 'processing':
      return 'processing';
    case 'shipped':
      return 'shipped';
    case 'delivered':
      return 'delivered';
    case 'cancelled':
    case 'canceled':
      return 'cancelled';
    case 'demo':
      return 'demo';
    case 'completed':
      return 'completed';
    default:
      return normalizeStatusValue(value);
  }
}

function toTitleCase(value) {
  if (!value) return '';
  return value
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getOrderStatusClass(status) {
  switch (normalizeOrderStatusValue(status)) {
    case 'pending':
      return 'order-status-pending';
    case 'processing':
      return 'order-status-processing';
    case 'shipped':
      return 'order-status-shipped';
    case 'delivered':
      return 'order-status-delivered';
    case 'cancelled':
    case 'canceled':
      return 'order-status-cancelled';
    default:
      return '';
  }
}

export function getOrderStatusLabel(status) {
  switch (normalizeOrderStatusValue(status)) {
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
    case 'canceled':
      return 'Canceled';
    case 'demo':
      return 'Demo order';
    case 'completed':
      return 'Completed';
    default:
      return toTitleCase(normalizeStatusValue(status));
  }
}

export function getPaymentStatusLabel(status, { demoMode = false } = {}) {
  switch (normalizeStatusValue(status)) {
    case 'demo':
      return 'Demo order';
    case 'demo paid':
      return 'Demo order paid';
    case 'demo pending':
      return 'Demo order pending';
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Payment pending';
    case 'processing':
      return 'Processing';
    case 'failed':
      return 'Payment failed';
    case 'expired':
      return 'Payment expired';
    case 'refunded':
      return 'Refunded';
    case 'canceled':
    case 'cancelled':
      return 'Canceled';
    case 'completed':
      return 'Completed';
    default:
      return demoMode ? 'Demo order' : toTitleCase(normalizeStatusValue(status));
  }
}
