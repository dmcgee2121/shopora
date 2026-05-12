import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import CatalogStatusNote from '../../components/CatalogStatusNote';
import ShopOraImage from '../../components/ShopOraImage';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import {
  getCatalogAttentionProducts,
  getCatalogReadinessSummary,
} from '../../utils/catalogReadiness';
import {
  getOrderStatusClass,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  normalizeOrderStatusValue,
} from '../../utils/statusUtils';

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

function SummaryRow({ label, value, note, toneClass = '' }) {
  return (
    <div className="admin-summary-row">
      <div className="admin-summary-copy">
        <strong>{label}</strong>
        <span>{note}</span>
      </div>
      <div className={`admin-summary-value ${toneClass}`.trim()}>
        <strong>{value}</strong>
      </div>
    </div>
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
  const { users, currentUser } = useAuth();
  const { orders, ordersSource, isOrdersLoading } = useOrders();
  const { products } = useProductCatalog();
  const orderSourceNote =
    currentUser?.role === 'admin'
      ? ordersSource === 'supabase'
        ? 'This admin session is reading live Supabase admin orders through the protected RPC.'
        : 'This prototype admin session is reading browser-local demo orders only. Supabase customer orders stay visible in customer accounts, but they are not exposed to this local admin login.'
      : '';
  const dashboardSubtitle =
    ordersSource === 'supabase'
      ? 'A clean snapshot of live Supabase order activity and catalog health for the current admin session.'
      : 'A clean snapshot of sales, catalog health, and recent order movement using local demo data.';
  const catalogReadiness = useMemo(() => getCatalogReadinessSummary(products), [products]);
  const attentionProducts = useMemo(() => getCatalogAttentionProducts(products, { limit: 4 }), [products]);
  const storefrontReady = catalogReadiness.totalProducts > 0 && catalogReadiness.productsNeedingAttention === 0;

  const analytics = useMemo(() => {
    const orderedOrders = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const normalizedStatus = (order) => normalizeOrderStatusValue(order.status);
    const activeOrders = orderedOrders.filter((order) =>
      ['pending', 'processing', 'shipped'].includes(normalizedStatus(order)),
    );
    const completedOrders = orderedOrders.filter((order) => normalizedStatus(order) !== 'cancelled');
    const pendingOrders = orderedOrders.filter((order) => normalizedStatus(order) === 'pending').length;
    const processingOrders = orderedOrders.filter((order) => normalizedStatus(order) === 'processing').length;
    const shippedOrders = orderedOrders.filter((order) => normalizedStatus(order) === 'shipped').length;
    const deliveredOrders = orderedOrders.filter((order) => normalizedStatus(order) === 'delivered').length;
    const cancelledOrders = orderedOrders.filter((order) => normalizedStatus(order) === 'cancelled').length;

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
        subtitle={dashboardSubtitle}
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

      {orderSourceNote ? (
        <div className="admin-notice admin-catalog-error" role="note">
          <p>{orderSourceNote}</p>
        </div>
      ) : null}

      {isOrdersLoading && ordersSource === 'supabase' ? (
        <div className="admin-notice" role="status" aria-live="polite">
          <p>Loading live Supabase orders for this admin session.</p>
        </div>
      ) : null}

      <section className="admin-dashboard-overview">
        <div className="admin-dashboard-overview-main">
          <div className="admin-dashboard-section-heading">
            <span>Revenue and order activity</span>
            <p>
              {ordersSource === 'supabase'
                ? 'Core numbers and order movement pulled from the current live Supabase admin session.'
                : 'Core numbers and live demo signals pulled from the current local product and order state.'}
            </p>
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

          <section className="admin-dashboard-panel admin-dashboard-panel-soft admin-store-readiness-panel">
            <div className="admin-dashboard-section-heading compact">
              <span>Store readiness</span>
              <p>
                {catalogReadiness.totalProducts
                  ? 'A compact view of catalog health before demos, screenshots, or future launches.'
                  : 'No products are in the catalog yet, so readiness signals will populate after the first item is added.'}
              </p>
            </div>

            <div className="admin-store-readiness-grid">
              <SummaryRow
                label="Total products"
                value={catalogReadiness.totalProducts}
                note="All products currently in the catalog."
              />
              <SummaryRow
                label="Active products"
                value={catalogReadiness.activeProducts}
                note="Visible on the storefront."
              />
              <SummaryRow
                label="Low stock"
                value={catalogReadiness.lowStockProducts}
                note="Items that should be replenished soon."
                toneClass="stock-low"
              />
              <SummaryRow
                label="Out of stock"
                value={catalogReadiness.outOfStockProducts}
                note="Unavailable until inventory returns."
                toneClass="stock-out"
              />
              <SummaryRow
                label="Needs attention"
                value={catalogReadiness.productsNeedingAttention}
                note="Products with issues to fix before demos."
                toneClass="admin-issue-missing"
              />
              <SummaryRow
                label="Missing merchandising info"
                value={catalogReadiness.missingMerchandisingInfo}
                note="Missing images, copy, SKU, price, or stock details."
                toneClass="status-badge-muted"
              />
            </div>

            <div className="admin-store-readiness-footer">
              <span className={`status-badge ${storefrontReady ? 'status-active' : 'status-draft'}`}>
                {storefrontReady ? 'Catalog looks ready' : 'Catalog needs attention'}
              </span>
              <p>
                {storefrontReady
                  ? 'Storefront-facing data is in good shape.'
                  : `${catalogReadiness.productsNeedingAttention} product${catalogReadiness.productsNeedingAttention === 1 ? '' : 's'} still need work before the catalog feels demo-ready.`}
              </p>
            </div>
          </section>

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
                  label="Active products"
                  value={catalogReadiness.activeProducts}
                  total={products.length}
                  note="Visible and shopping-ready."
                  toneClass="stock-in"
                />
                <ProgressRow
                  label="Low stock"
                  value={catalogReadiness.lowStockProducts}
                  total={products.length}
                  note="Worth replenishing soon."
                  toneClass="stock-low"
                />
                <ProgressRow
                  label="Out of stock"
                  value={catalogReadiness.outOfStockProducts}
                  total={products.length}
                  note="Unavailable until replenished."
                  toneClass="stock-out"
                />
                <ProgressRow
                  label="Needs attention"
                  value={catalogReadiness.productsNeedingAttention}
                  total={products.length}
                  note="Products with missing or incomplete merchandising data."
                  toneClass="admin-issue-missing"
                />
              </div>
            </div>
          </div>
        </div>

        <aside className="admin-dashboard-overview-side">
          <section className="admin-dashboard-panel admin-dashboard-panel-dark">
            <div className="admin-dashboard-section-heading compact dark">
              <span>Quick actions</span>
              <p>Fast jumps to the common operational tasks for this storefront.</p>
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
                label="Review Catalog"
                description="Check product readiness and issue details."
              />
              <QuickActionLink
                to="/admin/orders"
                label="Review Orders"
                description="Review recent order activity."
              />
              <QuickActionLink
                to="/admin/customers"
                label="View Customers"
                description="Open customer records and saved-item signals."
              />
              <QuickActionLink
                to="/admin/products"
                label="Check Storefront Readiness"
                description="Review catalog health and attention items."
              />
              <QuickActionLink to="/" label="View Storefront" description="See the public shop experience." />
            </div>
          </section>

          <section className="admin-dashboard-panel">
            <div className="admin-dashboard-section-heading compact">
              <span>Needs attention</span>
              <p>
                {attentionProducts.length
                  ? 'A short list of product fixes to handle before screenshots, demos, or future launch prep.'
                  : storefrontReady
                    ? 'Storefront is in good shape. No immediate catalog issues are flagged right now.'
                    : 'No products were matched for issues yet, but the catalog still has readiness gaps.'}
              </p>
            </div>

            {attentionProducts.length ? (
              <div className="admin-attention-list">
                {attentionProducts.map(({ product, issues, issueCount }) => (
                  <article key={product.id} className="admin-attention-item">
                    <div className="admin-attention-item-header">
                      <div>
                        <strong>{safeText(product.name, 'Untitled product')}</strong>
                        <p>
                          {safeText(product.brand, 'Unbranded')}
                          {' • '}
                          {safeText(product.sku, 'No SKU assigned')}
                        </p>
                      </div>
                      <span className="admin-attention-count">
                        {issueCount} issue{issueCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="status-badges admin-issue-badges">
                      {issues.slice(0, 3).map((issue) => (
                        <span key={issue.key} className={`status-badge ${issue.tone}`}>
                          {issue.label}
                        </span>
                      ))}
                      {issues.length > 3 ? (
                        <span className="status-badge status-badge-muted">+{issues.length - 3} more</span>
                      ) : null}
                    </div>

                    <p className="admin-attention-detail">{issues[0]?.detail ?? 'Review the product record for missing catalog data.'}</p>

                    <div className="admin-attention-actions">
                      <Link to="/admin/products" className="text-button">
                        Review catalog
                      </Link>
                      <Link to={`/admin/products/${product.id}/edit`} className="text-button">
                        Edit product
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-readiness-empty">
                <h3>Storefront is in good shape.</h3>
                <p>Catalog-ready products are already covering the basics for screenshots and demos.</p>
                <div className="admin-empty-state-actions">
                  <Link to="/admin/products" className="btn btn-ghost btn-small">
                    Review catalog
                  </Link>
                  <Link to="/admin/products/new" className="btn btn-dark btn-small">
                    Add Product
                  </Link>
                </div>
              </div>
            )}
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
              {ordersSource === 'supabase'
                ? 'This dashboard is backed by live Supabase admin order reads for the current session. Checkout, auth, Stripe, and backend contracts remain untouched.'
                : 'This dashboard uses local demo data only. It is intentionally presentation-focused and keeps checkout, auth, Stripe, and backend contracts untouched.'}
            </p>
            {ordersSource === 'supabase' ? (
              <p className="admin-catalog-helper">
                Order data is sourced from live Supabase admin reads for this session.
              </p>
            ) : null}
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
