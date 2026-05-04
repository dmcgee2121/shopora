import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import ShopOraImage from '../components/ShopOraImage';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { getOrderItemImage } from '../utils/orderItemUtils';

function formatDate(value) {
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

function getStatusClass(status) {
  switch (status) {
    case 'Pending':
      return 'order-status-pending';
    case 'Processing':
      return 'order-status-processing';
    case 'Shipped':
      return 'order-status-shipped';
    case 'Delivered':
      return 'order-status-delivered';
    case 'Cancelled':
      return 'order-status-cancelled';
    default:
      return '';
  }
}

export default function OrdersPage() {
  const { currentUser, authSource } = useAuth();
  const { getOrdersByUser, isOrdersLoading, ordersError } = useOrders();
  const orders = currentUser ? getOrdersByUser(currentUser.id) : [];

  if (isOrdersLoading && authSource === 'supabase') {
    return (
      <section className="container account-page">
        <div className="section-heading">
          <div className="page-heading-brand-wrap">
            <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
            <div>
              <p className="eyebrow">Account</p>
              <h1>Orders</h1>
              <p>Loading your orders...</p>
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
                ? `Order history for ${currentUser.firstName}.`
                : 'Completed orders will appear here.'}
            </p>
          </div>
        </div>
        <span className="count-badge">{orders.length} order{orders.length === 1 ? '' : 's'}</span>
      </div>

      {ordersError ? <div className="auth-message auth-message-error">{ordersError}</div> : null}

      {orders.length ? (
        <div className="account-order-list">
          {orders.map((order) => {
            const orderItems = Array.isArray(order.items) ? order.items : [];

            return (
              <article
                key={order.id}
                className={order.status === 'Cancelled' ? 'account-order-card is-cancelled' : 'account-order-card'}
              >
                <div className="account-order-top">
                  <div>
                    <span className="account-order-number">{order.orderNumber}</span>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="account-order-tags">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span>
                    <span className="status-badge">{order.paymentStatus}</span>
                  </div>
                </div>

                <div className="account-order-summary">
                  <div>
                    <span>Items</span>
                    <strong>{orderItems.length}</strong>
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>${Number(order.total ?? 0).toFixed(2)}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{order.customerEmail}</strong>
                  </div>
                  <div>
                    <span>Payment</span>
                    <strong>
                      {order.paymentStatus}
                      {order.paymentProvider ? ` · ${order.paymentProvider}` : ''}
                    </strong>
                  </div>
                </div>

                <div className="account-order-items">
                  {orderItems.slice(0, 3).map((item) => (
                    <div key={item.key} className="account-order-item">
                      <ShopOraImage
                        src={getOrderItemImage(item)}
                        alt={item.name || 'Order item'}
                        className="account-order-item-image"
                        fallbackText="ShopOra"
                      />
                      <div className="account-order-item-copy">
                        <strong>{item.name}</strong>
                        <p>
                          Qty {item.quantity}
                          {item.size ? ` · Size ${item.size}` : ''}
                          {item.color ? ` · ${item.color}` : ''}
                        </p>
                      </div>
                      <strong>${(Number(item.unitPrice ?? 0) * Number(item.quantity ?? 0)).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>

                <div className="account-order-footer">
                  <div className="account-order-stats">
                    <span>
                      {orderItems.length} item{orderItems.length === 1 ? '' : 's'}
                    </span>
                    <strong>${Number(order.total ?? 0).toFixed(2)}</strong>
                  </div>
                  {order.status === 'Cancelled' ? (
                    <p className="account-order-cancelled-note">
                      Cancelled orders remain in your history for reference.
                    </p>
                  ) : null}
                </div>

                <div className="account-order-actions">
                  <Link to={`/account/orders/${order.id}`} className="btn btn-ghost btn-small">
                    View Details
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
              ? 'Your Supabase customer orders will appear here after checkout.'
              : 'This storefront is running in frontend-only demo mode, so completed orders will show up here after checkout.'}
          </p>
          <Link to="/women" className="btn btn-dark">
            Start shopping
          </Link>
        </div>
      )}
    </section>
  );
}
