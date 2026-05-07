import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import CatalogStatusNote from '../../components/CatalogStatusNote';
import ShopOraImage from '../../components/ShopOraImage';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getOrderStatusClass, getOrderStatusLabel, getPaymentStatusLabel } from '../../utils/statusUtils';

function safeText(value, fallback = '-') {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || fallback;
}

function formatMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '-';
}

function formatShortDate(value) {
  if (!value) return 'Date unavailable';

  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return safeText(value, 'Date unavailable');
  }
}

function getPaymentBadgeClass(paymentStatus, demoMode) {
  const label = getPaymentStatusLabel(paymentStatus, { demoMode }).toLowerCase();

  if (label.includes('paid') || label === 'demo order') return 'stock-in';
  if (label.includes('pending')) return 'stock-low';
  if (label.includes('failed') || label.includes('expired') || label.includes('canceled')) return 'stock-out';
  return '';
}

function DashboardMetric({ label, value, note }) {
  return (
    <article className="admin-dashboard-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <p>{note}</p> : null}
    </article>
  );
}

function ProgressRow({ label, value, total, note, toneClass = '' }) {
  const percent = total > 0 ? Math.max(4, Math.round((value / total) * 100)) : 0;

  return (
    <div className="admin-progress-row">
      <div className="admin-progress-copy">
        <strong>{label}</strong>
        <span>
          {value} of {total}
        </span>
      </div>
      <div className="admin-progress-track" aria-hidden="true">
        <div className={`admin-progress-fill ${toneClass}`.trim()} style={{ width: `${percent}%` }} />
      </div>
      <p>{note}</p>
    </div>
  );
}

function OrderActivityRow({ order }) {
  const paymentLabel = getPaymentStatusLabel(order.paymentStatus, { demoMode: order.demoMode });
  const paymentClass = getPaymentBadgeClass(order.paymentStatus, order.demoMode);
  const orderStatusClass = getOrderStatusClass(order.status);

  return (
    <article className="admin-activity-item">
      <div className="admin-activity-copy">
        <div className="admin-activity-copy-top">
          <div>
            <strong>{safeText(order.orderNumber, 'Order')}</strong>
            <p>
              {safeText(order.customerName, 'Guest customer')}
            </p>
          </div>
          <strong>{formatMoney(order.total)}</strong>
        </div>

        <div className="admin-activity-row">
          <span className={`status-badge ${orderStatusClass}`.trim()}>{getOrderStatusLabel(order.status)}</span>
          <span className="admin-activity-date">{formatShortDate(order.createdAt)}</span>
        </div>

        <div className="admin-activity-meta">
          <span className={`status-badge ${paymentClass}`.trim()}>{paymentLabel}</span>
          <span className="count-badge">
            {Array.isArray(order.items) ? order.items.length : 0} item
            {Array.isArray(order.items) && order.items.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </article>
  );
}

function QuickActionLink({ to, label, description, className = 'btn btn-ghost' }) {
  return (
    <Link to={to} className={`admin-quick-action ${className}`.trim()}>
      <strong>{label}</strong>
      <span>{description}</span>
    </Link>
  );
}

export default function AdminDashboard() {
  const { users } = useAuth();
  const { orders } = useOrders();
  const { products } = useProductCatalog();

  const analytics = useMemo(() => {
    const orderedOrders = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const activeOrders = orderedOrders.filter((order) => ['Pending', 'Processing', 'Shipped'].includes(order.status));
    const completedOrders = orderedOrders.filter((order) => order.status !== 'Cancelled');
    const pendingOrders = orderedOrders.filter((order) => order.status === 'Pending').length;
    const processingOrders = orderedOrders.filter((order) => order.status === 'Processing').length;
    const shippedOrders = orderedOrders.filter((order) => order.status === 'Shipped').length;
    const deliveredOrders = orderedOrders.filter((order) => order.status === 'Delivered').length;
    const cancelledOrders = orderedOrders.filter((order) => order.status === 'Cancelled').length;

    const saleProducts = products.filter((product) => product.isSale).length;
    const newProducts = products.filter((product) => product.isNew).length;
    const lowStockItems = products.filter((product) => product.stockCount > 0 && product.stockCount < 8);
    const outOfStockItems = products.filter((product) => product.stockCount <= 0);
    const inStockProducts = products.filter((product) => product.stockCount >= 8).length;
    const catalogHighlights = products.filter((product) => product.isNew || product.isSale).slice(0, 4);

    const customerCount = users.filter((user) => user.role !== 'admin').length;
    const savedTotal = users.reduce((total, user) => total + (user.savedProductIds?.length ?? 0), 0);
    const demoRevenueTotal = completedOrders.reduce((total, order) => total + Number(order.total ?? 0), 0);
    const averageOrderValue = completedOrders.length ? demoRevenueTotal / completedOrders.length : 0;
    const totalItems = orderedOrders.reduce(
      (total, order) =>
        total +
        (Array.isArray(order.items)
          ? order.items.reduce((itemTotal, item) => itemTotal + Number(item.quantity ?? 0), 0)
          : 0),
      0,
    );
    const averageItemsPerOrder = orderedOrders.length ? totalItems / orderedOrders.length : 0;
    const repeatCustomerCount = Array.from(
      orderedOrders.reduce((map, order) => {
        const key = (order.customerEmail || order.userId || order.customerName || '').trim().toLowerCase();
        if (!key) return map;
        map.set(key, (map.get(key) ?? 0) + 1);
        return map;
      }, new Map()).values(),
    ).filter((count) => count > 1).length;

    const totalInventoryValue = products.reduce(
      (total, product) => total + Number(product.price ?? 0) * Number(product.stockCount ?? 0),
      0,
    );

    return {
      orderedOrders,
      activeOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      saleProducts,
      newProducts,
      lowStockItems,
      outOfStockItems,
      inStockProducts,
      catalogHighlights,
      customerCount,
      savedTotal,
      demoRevenueTotal,
      averageOrderValue,
      totalItems,
      averageItemsPerOrder,
      repeatCustomerCount,
      totalInventoryValue,
    };
  }, [orders, products, users]);

  return (
    <div className="admin-page-stack admin-dashboard-page">
      <AdminPageHeader
        eyebrow="ShopOra Admin"
        title="Operations Dashboard"
        subtitle="A clean snapshot of sales, catalog health, and recent order movement using local demo data."
        actions={
          <>
            <Link to="/admin/products/new" className="btn btn-dark">
              Add Product
            </Link>
            <Link to="/admin/orders" className="btn btn-ghost">
              Review Orders
            </Link>
            <Link to="/" className="btn btn-outline">
              View Storefront
            </Link>
          </>
        }
      />

      <CatalogStatusNote variant="admin" className="admin-dashboard-status" />

      <section className="admin-dashboard-overview">
        <div className="admin-dashboard-overview-main">
          <div className="admin-dashboard-section-heading">
            <span>Revenue and order activity</span>
            <p>Core numbers and live demo signals pulled from the current local product and order state.</p>
          </div>

          <div className="admin-dashboard-metric-grid">
            <DashboardMetric
              label="Demo revenue"
              value={formatMoney(analytics.demoRevenueTotal)}
              note={`${analytics.orderedOrders.length} orders since the latest demo reset`}
            />
            <DashboardMetric
              label="Average order value"
              value={formatMoney(analytics.averageOrderValue)}
              note={`${analytics.activeOrders.length} active orders currently in motion`}
            />
            <DashboardMetric
              label="Catalog value"
              value={formatMoney(analytics.totalInventoryValue)}
              note={`${analytics.saleProducts} sale items and ${analytics.newProducts} new arrivals`}
            />
            <DashboardMetric
              label="Customers"
              value={analytics.customerCount}
              note={`${analytics.repeatCustomerCount} repeat shoppers in the demo data`}
            />
          </div>

          <div className="admin-dashboard-mini-grid">
            <div className="admin-dashboard-panel admin-dashboard-panel-soft">
              <div className="admin-dashboard-section-heading compact">
                <span>Order activity</span>
                <p>Where the queue is concentrated right now.</p>
              </div>

              <div className="admin-progress-list">
                <ProgressRow
                  label="Pending"
                  value={analytics.pendingOrders}
                  total={analytics.orderedOrders.length}
                  note="Waiting for review or fulfillment."
                  toneClass="order-status-pending"
                />
                <ProgressRow
                  label="Processing"
                  value={analytics.processingOrders}
                  total={analytics.orderedOrders.length}
                  note="Being packed or prepared."
                  toneClass="order-status-processing"
                />
                <ProgressRow
                  label="Shipped"
                  value={analytics.shippedOrders}
                  total={analytics.orderedOrders.length}
                  note="In transit to the customer."
                  toneClass="order-status-shipped"
                />
              </div>
            </div>

            <div className="admin-dashboard-panel admin-dashboard-panel-soft">
              <div className="admin-dashboard-section-heading compact">
                <span>Catalog health</span>
                <p>Products needing attention versus healthy stock.</p>
              </div>

              <div className="admin-progress-list">
                <ProgressRow
                  label="Healthy stock"
                  value={analytics.inStockProducts}
                  total={products.length}
                  note="Safe for shoppers to discover and buy."
                  toneClass="stock-in"
                />
                <ProgressRow
                  label="Low stock"
                  value={analytics.lowStockItems.length}
                  total={products.length}
                  note="Worth replenishing soon."
                  toneClass="stock-low"
                />
                <ProgressRow
                  label="Out of stock"
                  value={analytics.outOfStockItems.length}
                  total={products.length}
                  note="Unavailable until replenished."
                  toneClass="stock-out"
                />
              </div>
            </div>
          </div>
        </div>

        <aside className="admin-dashboard-overview-side">
          <section className="admin-dashboard-panel admin-dashboard-panel-dark">
            <div className="admin-dashboard-section-heading compact dark">
              <span>Quick actions</span>
              <p>Fast jumps to the common admin tasks on this prototype.</p>
            </div>

            <div className="admin-quick-action-grid">
              <QuickActionLink
                to="/admin/products/new"
                label="Add Product"
                description="Create a new catalog item."
                className="btn btn-dark"
              />
              <QuickActionLink
                to="/admin/products"
                label="Manage Products"
                description="Edit, restock, or remove items."
              />
              <QuickActionLink
                to="/admin/orders"
                label="View Orders"
                description="Review recent order activity."
              />
              <QuickActionLink to="/" label="View Storefront" description="See the public shop experience." />
            </div>
          </section>

          <section className="admin-dashboard-panel">
            <div className="admin-dashboard-section-heading compact">
              <span>Customer activity</span>
              <p>Local account and order signals worth watching during demos.</p>
            </div>

            <div className="admin-insight-list">
              <div className="admin-insight-row">
                <strong>{analytics.savedTotal}</strong>
                <span>Saved items across demo customers</span>
              </div>
              <div className="admin-insight-row">
                <strong>{analytics.averageItemsPerOrder.toFixed(1)}</strong>
                <span>Average items per order</span>
              </div>
              <div className="admin-insight-row">
                <strong>{analytics.totalItems}</strong>
                <span>Total items sold across demo orders</span>
              </div>
              <div className="admin-insight-row">
                <strong>{analytics.deliveredOrders}</strong>
                <span>Delivered orders</span>
              </div>
            </div>

            <p className="admin-dashboard-note">
              This dashboard uses local demo data only. It is intentionally presentation-focused and
              keeps checkout, auth, Stripe, and backend contracts untouched.
            </p>
          </section>
        </aside>
      </section>

      <div className="admin-dashboard-panels">
        <section className="admin-dashboard-panel">
          <div className="admin-dashboard-section-heading">
            <span>Recent order activity</span>
            <p>The latest orders and their current fulfillment state.</p>
          </div>

          {analytics.orderedOrders.length ? (
            <div className="admin-activity-list">
              {analytics.orderedOrders.slice(0, 5).map((order) => (
                <OrderActivityRow key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="admin-empty-state admin-empty-state-tight">
              <h3>No orders yet.</h3>
              <p>Completed checkouts will appear here once demo orders are created.</p>
              <div className="admin-empty-state-actions">
                <Link to="/admin/orders" className="btn btn-ghost">
                  View Orders
                </Link>
              </div>
            </div>
          )}
          <div className="admin-panel-footer">
            <Link to="/admin/orders" className="text-button">
              Open full order management
            </Link>
          </div>
        </section>

        <section className="admin-dashboard-panel">
          <div className="admin-dashboard-section-heading">
            <span>Inventory attention</span>
            <p>Items most likely to need a restock or follow-up.</p>
          </div>

          {analytics.lowStockItems.length || analytics.outOfStockItems.length ? (
            <div className="admin-record-list">
              {[...analytics.outOfStockItems, ...analytics.lowStockItems].slice(0, 6).map((product) => {
                const stockCount = Number(product.stockCount ?? 0);
                const stockLabel = stockCount <= 0 ? 'Out of stock' : `${stockCount} left`;
                const stockClass = stockCount <= 0 ? 'stock-out' : 'stock-low';

                return (
                  <article key={product.id} className="admin-record-card admin-dashboard-product-row">
                    <ShopOraImage
                      src={product.image}
                      alt={safeText(product.name, 'Product')}
                      className="admin-dashboard-product-thumb"
                      fallbackText="ShopOra"
                    />
                    <div className="admin-record-meta">
                      <strong>{safeText(product.name, 'Unnamed product')}</strong>
                      <span>
                        {safeText(product.brand, 'ShopOra')} | {safeText(product.department, 'Unassigned')} /{' '}
                        {safeText(product.category, 'Unassigned')}
                      </span>
                      <div className="admin-attention-row">
                        <span className={`status-badge ${stockClass}`.trim()}>{stockLabel}</span>
                        <span className="admin-attention-meta">
                          {stockCount <= 0 ? 'Needs restock' : 'Low inventory'}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="admin-empty-state admin-empty-state-tight">
              <h3>All products are stocked.</h3>
              <p>No products are currently in the low-stock or out-of-stock buckets.</p>
            </div>
          )}

          <div className="admin-panel-footer">
            <Link to="/admin/products" className="text-button">
              Open product management
            </Link>
          </div>
        </section>
      </div>

      <div className="admin-dashboard-panels admin-dashboard-panels-secondary">
        <section className="admin-dashboard-panel">
          <div className="admin-dashboard-section-heading">
            <span>Catalog health</span>
            <p>Healthy, low, and out-of-stock status across the demo catalog.</p>
          </div>

          <div className="admin-progress-list">
            <ProgressRow
              label="Healthy stock"
              value={analytics.inStockProducts}
              total={products.length}
              note="Safe for shoppers to discover and buy."
              toneClass="stock-in"
            />
            <ProgressRow
              label="Low stock"
              value={analytics.lowStockItems.length}
              total={products.length}
              note="Worth replenishing soon."
              toneClass="stock-low"
            />
            <ProgressRow
              label="Out of stock"
              value={analytics.outOfStockItems.length}
              total={products.length}
              note="Unavailable until replenished."
              toneClass="stock-out"
            />
          </div>

          <div className="admin-panel-footer">
            <Link to="/admin/products" className="text-button">
              Open product management
            </Link>
          </div>
        </section>

        <section className="admin-dashboard-panel">
          <div className="admin-dashboard-section-heading">
            <span>Catalog highlights</span>
            <p>Fresh or promoted items that are useful to keep visible during demos.</p>
          </div>

          {analytics.catalogHighlights.length ? (
            <div className="admin-highlight-list">
              {analytics.catalogHighlights.map((product) => (
                <article key={product.id} className="admin-highlight-item">
                  <ShopOraImage
                    src={product.image}
                    alt={safeText(product.name, 'Product')}
                    className="admin-highlight-thumb"
                    fallbackText="ShopOra"
                  />
                  <div className="admin-highlight-copy">
                    <div className="admin-highlight-row">
                      <strong>{safeText(product.name, 'Unnamed product')}</strong>
                      <span className={`status-badge ${product.isSale ? 'status-badge-sale' : 'status-badge-muted'}`}>
                        {product.isSale ? 'Sale' : 'New'}
                      </span>
                    </div>
                    <p>
                      {safeText(product.brand, 'ShopOra')} | {safeText(product.department, 'Unassigned')} /{' '}
                      {safeText(product.category, 'Unassigned')}
                    </p>
                    <div className="admin-highlight-meta">
                      <span>{formatMoney(product.salePrice ?? product.price)}</span>
                      <span>{Number(product.stockCount ?? 0)} in stock</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state admin-empty-state-tight">
              <h3>No featured products yet.</h3>
              <p>Mark products as new or sale to populate this area.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
