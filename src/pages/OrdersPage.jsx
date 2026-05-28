import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import ShopOraImage from '../components/ShopOraImage';
import SupportLinkStrip from '../components/SupportLinkStrip';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getCustomerRetentionLinks } from '../utils/customerRetention';
import { getSupportLinks } from '../utils/supportLinks';
import { getOrderItemImage } from '../utils/orderItemUtils';
import { getOrderStatusClass, getOrderStatusLabel, getPaymentStatusLabel } from '../utils/statusUtils';

function formatDate(value) {
  if (!value) return '';

  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatMoney(value) {
  return `$${safeNumber(value).toFixed(2)}`;
}

function hasMoneyValue(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

function getItemName(item) {
  return item?.name || item?.product?.name || item?.product_name || 'Order item';
}

function getItemDetails(item) {
  const details = [`Qty ${safeNumber(item?.quantity, 1)}`];
  if (item?.size) details.push(`Size ${item.size}`);
  if (item?.color) details.push(item.color);
  return details.join(' | ');
}

export default function OrdersPage() {
  const { currentUser, authSource } = useAuth();
  useDocumentTitle('ShopOra | Orders');
  const { getOrdersByUser, isOrdersLoading, ordersError } = useOrders();
  const orders = currentUser ? getOrdersByUser(currentUser.id) : [];
  const retentionLinks = getCustomerRetentionLinks(currentUser);
  const supportLinks = getSupportLinks(currentUser);
  const searchLinks = retentionLinks.searchLinks.slice(0, 2);

  if (isOrdersLoading && authSource === 'supabase') {
    return (
      <section className="container account-page">
        <div className="section-heading">
          <div className="page-heading-brand-wrap">
            <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
            <div>
              <p className="eyebrow">Account</p>
              <h1>Orders</h1>
              <p>Loading your order history...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container account-page">
      <div className="section-heading">
        <div className="page-heading-brand-wrap">
          <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
          <div>
            <p className="eyebrow">Account</p>
            <h1>Orders</h1>
            <p>
              {currentUser
                ? `Order history for ${currentUser.firstName || 'your account'}. Read-only receipts stay tied to this account.`
                : 'Completed orders on this device will appear here.'}
            </p>
          </div>
        </div>
        <span className="count-badge">
          {orders.length} order{orders.length === 1 ? '' : 's'}
        </span>
      </div>

      <p className="account-page-note">
        Use this page to review recent purchases, open a receipt, or head back to browsing. ShopOra keeps order
        history visible for quick reference and support.
      </p>

      <div className="account-toolbar">
        <div className="catalog-context">
          <span className="query-chip">Keep receipts close by</span>
          <span className="query-chip">Saved items and orders stay together</span>
          <span className="query-chip">ShopOra account view</span>
        </div>
        <div className="empty-state-actions">
          <Link to={retentionLinks.continueShopping.to} className="btn btn-dark btn-small">
            {retentionLinks.continueShopping.label}
          </Link>
          <Link to={retentionLinks.browseSale.to} className="btn btn-ghost btn-small">
            {retentionLinks.browseSale.label}
          </Link>
          <Link to={retentionLinks.savedItems.to} className="btn btn-ghost btn-small">
            {retentionLinks.savedItems.label}
          </Link>
        </div>
      </div>

      <SupportLinkStrip
        title="Need help with a receipt?"
        description="Keep the receipt or order number handy, then use these support shortcuts for shipping, returns, privacy, or account help."
        links={supportLinks}
      />

      {ordersError ? <div className="auth-message auth-message-error">{ordersError}</div> : null}

      {orders.length ? (
        <div className="account-order-list">
          {orders.map((order) => {
            const orderItems = Array.isArray(order.items) ? order.items : [];
            const orderStatusLabel = getOrderStatusLabel(order.status);
            const paymentStatusLabel = getPaymentStatusLabel(order.paymentStatus, {
              demoMode: Boolean(order.demoMode),
            });
            const orderStatusClass = getOrderStatusClass(order.status);
            const orderDate = formatDate(order.createdAt);
            const itemCount = orderItems.length;
            const isCancelled = orderStatusLabel === 'Canceled';

            return (
              <article
                key={order.id}
                className={isCancelled ? 'account-order-card is-cancelled' : 'account-order-card'}
              >
                <div className="account-order-top">
                  <div>
                    <span className="account-order-number">{order.orderNumber}</span>
                    <p>
                      {orderDate || 'Order date unavailable'} / {itemCount} item{itemCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="account-order-tags">
                    <span className={`status-badge ${orderStatusClass}`}>{orderStatusLabel || 'Pending'}</span>
                    <span className="status-badge">{paymentStatusLabel}</span>
                    <Link to={`/account/orders/${order.id}`} className="text-button">
                      View receipt
                    </Link>
                  </div>
                </div>

                <div className="account-order-summary">
                  <div>
                    <span>Items</span>
                    <strong>{itemCount}</strong>
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>{hasMoneyValue(order.total) ? formatMoney(order.total) : 'Unavailable'}</strong>
                  </div>
                  <div>
                    <span>Customer</span>
                    <strong>{order.customerName || order.customerEmail || 'Customer details unavailable'}</strong>
                  </div>
                  <div>
                    <span>Order status</span>
                    <strong>{orderStatusLabel || 'Pending'}</strong>
                  </div>
                </div>

                <div className="account-order-items">
                  {orderItems.slice(0, 3).map((item, index) => (
                    <div key={item.key || item.id || index} className="account-order-item">
                      <ShopOraImage
                        src={getOrderItemImage(item)}
                        alt={getItemName(item)}
                        className="account-order-item-image"
                        fallbackText="ShopOra"
                      />
                      <div className="account-order-item-copy">
                        <strong>{getItemName(item)}</strong>
                        <p>{getItemDetails(item)}</p>
                      </div>
                      <strong>{formatMoney(safeNumber(item?.unitPrice) * safeNumber(item?.quantity, 1))}</strong>
                    </div>
                  ))}
                  {!orderItems.length ? <p className="account-order-empty-items">Item details are unavailable.</p> : null}
                </div>

                <div className="account-order-footer">
                  <div className="account-order-stats">
                    <span>
                      {itemCount} item{itemCount === 1 ? '' : 's'}
                    </span>
                    <strong>{hasMoneyValue(order.total) ? formatMoney(order.total) : 'Unavailable'}</strong>
                  </div>
                  {isCancelled ? (
                    <p className="account-order-cancelled-note">Canceled orders stay in your history for reference.</p>
                  ) : null}
                </div>

                <div className="account-order-actions">
                  <Link to={`/account/orders/${order.id}`} className="btn btn-ghost btn-small">
                    View receipt
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state account-empty">
          <h2>{authSource === 'supabase' ? 'No orders yet.' : 'No demo orders yet.'}</h2>
          <p>
            {authSource === 'supabase'
              ? 'Your read-only receipts will appear here after checkout. Until then, browse fresh picks, save a few favorites, or check the sale. Receipts stay tied to your account for quick review later.'
              : 'Demo orders on this device will appear here after checkout. Until then, browse fresh picks, save a few favorites, or check the sale. Receipts stay tied to this demo account for quick review later.'}
          </p>
          <div className="empty-state-actions">
            <Link to={retentionLinks.continueShopping.to} className="btn btn-dark">
              {retentionLinks.continueShopping.label}
            </Link>
            <Link to={retentionLinks.browseSale.to} className="btn btn-ghost">
              {retentionLinks.browseSale.label}
            </Link>
            <Link to={retentionLinks.savedItems.to} className="btn btn-ghost">
              {retentionLinks.savedItems.label}
            </Link>
          </div>
          <div className="recommendation-links account-empty-links" aria-label="Search shortcuts">
            {searchLinks.map((link) => (
              <Link key={link.to} to={link.to} className="query-chip">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
