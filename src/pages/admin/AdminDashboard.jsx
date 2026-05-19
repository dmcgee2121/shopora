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

const readinessToneByLabel = {
  Ready: 'status-active',
  'Ready to review': 'status-active',
  'Needs review': 'status-draft',
  'Monitor only': 'status-badge-muted',
  'Prototype/read-only': 'status-badge-muted',
  'Future backend work': 'admin-issue-missing',
};

function getReadinessTone(label) {
  return readinessToneByLabel[label] ?? 'status-badge-muted';
}

function ReadinessCard({ label, status, note, context }) {
  return (
    <article className="admin-status-card">
      <span>{label}</span>
      <div className="status-badges">
        <span className={`status-badge ${getReadinessTone(status)}`.trim()}>{status}</span>
        {context ? <span className="status-badge status-badge-muted">{context}</span> : null}
      </div>
      <p>{note}</p>
    </article>
  );
}

const priorityToneByLabel = {
  'High priority': 'priority-high',
  'Medium priority': 'priority-medium',
  Monitor: 'priority-monitor',
  'Future backend work': 'priority-future',
};

function getPriorityTone(label) {
  return priorityToneByLabel[label] ?? 'priority-monitor';
}

function PriorityActionCard({ label, status, note, context, links }) {
  return (
    <article className="admin-priority-action">
      <div className="admin-priority-action-header">
        <span>{label}</span>
        <span className={`status-badge ${getPriorityTone(status)}`.trim()}>{status}</span>
      </div>
      <p>{note}</p>
      {context ? <p className="admin-priority-action-context">{context}</p> : null}
      {Array.isArray(links) && links.length ? (
        <div className="admin-priority-action-links">
          {links.map((link) => (
            <Link key={`${label}-${link.to}-${link.label}`} to={link.to} className={link.className ?? 'btn btn-ghost'}>
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}

const weeklyReviewToneByLabel = {
  'Weekly review': 'priority-medium',
  'Buyer-facing': 'priority-high',
  'Admin readiness': 'priority-medium',
  'Monitor only': 'priority-monitor',
  'Future backend work': 'priority-future',
};

function getWeeklyReviewTone(label) {
  return weeklyReviewToneByLabel[label] ?? 'priority-monitor';
}

function WeeklyReviewCard({ label, status, note, context, links }) {
  return (
    <article className="admin-weekly-review-card">
      <div className="admin-priority-action-header">
        <span>{label}</span>
        <span className={`status-badge ${getWeeklyReviewTone(status)}`.trim()}>{status}</span>
      </div>
      <p>{note}</p>
      {context ? <p className="admin-priority-action-context">{context}</p> : null}
      {Array.isArray(links) && links.length ? (
        <div className="admin-priority-action-links">
          {links.map((link) => (
            <Link key={`${label}-${link.to}-${link.label}`} to={link.to} className={link.className ?? 'btn btn-ghost'}>
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}

const healthSummaryToneByLabel = {
  Healthy: 'status-active',
  'Needs review': 'status-draft',
  Monitor: 'priority-monitor',
  'Prototype/read-only': 'status-badge-muted',
  'Future backend work': 'priority-future',
};

function getHealthSummaryTone(label) {
  return healthSummaryToneByLabel[label] ?? 'priority-monitor';
}

function HealthSummaryCard({ label, status, note, context, links }) {
  return (
    <article className="admin-health-summary-card">
      <div className="admin-priority-action-header">
        <span>{label}</span>
        <span className={`status-badge ${getHealthSummaryTone(status)}`.trim()}>{status}</span>
      </div>
      <p>{note}</p>
      {context ? <p className="admin-priority-action-context">{context}</p> : null}
      {Array.isArray(links) && links.length ? (
        <div className="admin-priority-action-links">
          {links.map((link) => (
            <Link key={`${label}-${link.to}-${link.label}`} to={link.to} className={link.className ?? 'btn btn-ghost'}>
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
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

const storefrontPreviewToneByLabel = {
  Ready: 'status-active',
  'Needs review': 'status-draft',
  'Render-only': 'status-badge-muted',
  'Future backend work': 'admin-issue-missing',
};

function getStorefrontPreviewTone(label) {
  return storefrontPreviewToneByLabel[label] ?? 'status-badge-muted';
}

function StorefrontPreviewCard({ label, status, note, context }) {
  return (
    <article className="admin-status-card">
      <span>{label}</span>
      <div className="status-badges">
        <span className={`status-badge ${getStorefrontPreviewTone(status)}`.trim()}>{status}</span>
        {context ? <span className="status-badge status-badge-muted">{context}</span> : null}
      </div>
      <p>{note}</p>
    </article>
  );
}

function LaunchQANoteCard({ label, status, note, context }) {
  return (
    <article className="admin-status-card admin-launch-qa-card">
      <span>{label}</span>
      <div className="status-badges">
        <span className={`status-badge ${getReadinessTone(status)}`.trim()}>{status}</span>
        {context ? <span className="status-badge status-badge-muted">{context}</span> : null}
      </div>
      <p>{note}</p>
    </article>
  );
}

function LaunchReleaseNoteCard({ label, status, note, context }) {
  return (
    <article className="admin-status-card admin-launch-release-note-card">
      <span>{label}</span>
      <div className="status-badges">
        <span className={`status-badge ${getReadinessTone(status)}`.trim()}>{status}</span>
        {context ? <span className="status-badge status-badge-muted">{context}</span> : null}
      </div>
      <p>{note}</p>
    </article>
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
      ? 'A clean snapshot of live Supabase order activity, catalog health, and admin QA signals for the current session.'
      : 'A clean snapshot of sales, catalog health, and admin QA signals using local demo data.';
  const catalogReadiness = useMemo(() => getCatalogReadinessSummary(products), [products]);
  const attentionProducts = useMemo(() => getCatalogAttentionProducts(products, { limit: 4 }), [products]);

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

  const storeReadiness = useMemo(() => {
    const totalProducts = catalogReadiness.totalProducts;
    const missingImageCount = products.filter((product) => !safeText(product.image)).length;
    const missingPricingCount = products.filter((product) => {
      const price = Number(product.price);
      return !Number.isFinite(price) || price <= 0;
    }).length;
    const merchandiseHighlights = catalogReadiness.saleProducts + catalogReadiness.featuredProducts;
    const customerCount = analytics.customerCount;
    const savedItemCount = analytics.savedTotal;
    const productCoverageNeedsReview =
      totalProducts === 0 || catalogReadiness.productsNeedingAttention > 0 || missingImageCount > 0 || missingPricingCount > 0;
    const stockNeedsReview = catalogReadiness.lowStockProducts > 0 || catalogReadiness.outOfStockProducts > 0;

    const cards = [
      {
        key: 'catalog',
        label: 'Catalog readiness',
        status: totalProducts > 0 && !productCoverageNeedsReview ? 'Ready' : 'Needs review',
        note:
          totalProducts > 0 && !productCoverageNeedsReview
            ? 'Products, copy, prices, images, and merchandising details are in good shape for a pitch.'
            : totalProducts === 0
              ? 'Add products before the store can feel ready to sell.'
              : `${catalogReadiness.productsNeedingAttention} product${catalogReadiness.productsNeedingAttention === 1 ? '' : 's'} still need catalog work.`,
        context: 'Existing product data only',
      },
      {
        key: 'images',
        label: 'Product image coverage',
        status: totalProducts > 0 && missingImageCount === 0 ? 'Ready' : 'Needs review',
        note:
          totalProducts > 0 && missingImageCount === 0
            ? 'Every product has a primary image for the storefront.'
            : `${missingImageCount} product${missingImageCount === 1 ? '' : 's'} still need a primary image.`,
        context: 'Primary image URLs',
      },
      {
        key: 'pricing',
        label: 'Product pricing coverage',
        status: totalProducts > 0 && missingPricingCount === 0 ? 'Ready' : 'Needs review',
        note:
          totalProducts > 0 && missingPricingCount === 0
            ? 'Prices are set for the visible catalog.'
            : `${missingPricingCount} product${missingPricingCount === 1 ? '' : 's'} still need valid pricing.`,
        context: 'Base price fields',
      },
      {
        key: 'inventory',
        label: 'Stock / inventory attention',
        status: stockNeedsReview ? 'Needs review' : 'Ready',
        note:
          stockNeedsReview
            ? `${catalogReadiness.lowStockProducts} low-stock and ${catalogReadiness.outOfStockProducts} out-of-stock items should be checked before a release batch.`
            : 'Inventory looks healthy across the current catalog.',
        context: 'Low-stock and out-of-stock counts',
      },
      {
        key: 'merchandising',
        label: 'Sale / featured merchandising',
        status: merchandiseHighlights > 0 ? 'Ready' : 'Needs review',
        note:
          merchandiseHighlights > 0
            ? `${catalogReadiness.saleProducts} sale item${catalogReadiness.saleProducts === 1 ? '' : 's'} and ${catalogReadiness.featuredProducts} featured item${catalogReadiness.featuredProducts === 1 ? '' : 's'} are helping the storefront feel merchandised.`
            : 'Add a sale or featured product if you want stronger demo merchandising signals.',
        context: 'Sale and featured flags',
      },
      {
        key: 'customers',
        label: 'Customer account readiness',
        status: customerCount > 0 ? 'Ready' : 'Needs review',
        note:
          customerCount > 0
            ? `${customerCount} customer account${customerCount === 1 ? '' : 's'} are present for profile and account demos.`
            : 'Seed or connect customer accounts before a live pitch.',
        context: 'Auth-backed customer data',
      },
      {
        key: 'saved-items',
        label: 'Saved-items / account persistence status',
        status: 'Ready',
        note:
          savedItemCount > 0
            ? `${savedItemCount} saved item${savedItemCount === 1 ? '' : 's'} demonstrate persistence for the current demo data.`
            : 'Saved-items persistence is implemented, and demo/local fallback remains available even when the list is empty.',
        context: 'Mixed local and Supabase-backed flow',
      },
      {
        key: 'orders',
        label: 'Order operations readiness',
        status: 'Prototype/read-only',
        note:
          orders.length > 0
            ? 'Live orders can be reviewed in the admin UI, but status mutation, refunds, and fulfillment remain read-only here.'
            : 'The order operations view is ready for review, but live mutation is still not implemented.',
        context: ordersSource === 'supabase' ? 'Live Supabase reads' : 'Local demo reads',
      },
      {
        key: 'checkout',
        label: 'Checkout readiness reminder',
        status: 'Future backend work',
        note:
          'The checkout flow is in place, but public-facing production confidence still belongs in the next test-mode and release-batch review.',
        context: 'Use the checkout checklist before release',
      },
    ];

    const actionableCards = cards.filter((card) => card.key !== 'checkout');
    const overallStatus = actionableCards.some((card) => card.status === 'Needs review')
      ? 'Needs review'
      : actionableCards.some((card) => card.status === 'Prototype/read-only')
        ? 'Prototype/read-only'
        : 'Ready';

    const overallNote =
      overallStatus === 'Ready'
        ? 'The storefront and account surfaces are ready for a business-owner walkthrough.'
        : overallStatus === 'Prototype/read-only'
          ? 'The storefront can sell, but admin order operations are still intentionally read-only.'
          : 'The store is close, but catalog cleanup and production confidence checks still need review.';

    return {
      cards,
      overallStatus,
      overallNote,
    };
  }, [analytics.customerCount, analytics.savedTotal, catalogReadiness, orders.length, ordersSource, products]);

  const storefrontPreview = useMemo(() => {
    const totalProducts = catalogReadiness.totalProducts;
    const hasCatalog = totalProducts > 0;
    const hasSearchableCatalog =
      products.some((product) => safeText(product.name) || safeText(product.brand) || safeText(product.category)) &&
      hasCatalog;
    const categoriesPreview = Array.from(
      new Set(products.map((product) => product.department).filter(Boolean)),
    ).slice(0, 4);
    const categoryReady = categoriesPreview.length > 0;
    const homeMerchandisingReady = hasCatalog && (catalogReadiness.saleProducts > 0 || catalogReadiness.featuredProducts > 0);
    const productDetailReady = hasCatalog && catalogReadiness.productsNeedingAttention === 0;
    const savedTouchpointsReady = analytics.savedTotal > 0 || analytics.customerCount > 0;
    const cartReady = catalogReadiness.activeProducts > 0 && catalogReadiness.outOfStockProducts < totalProducts;
    const policyPagesReady = true;

    const cards = [
      {
        key: 'home',
        label: 'Home page merchandising',
        status: homeMerchandisingReady ? 'Ready' : 'Needs review',
        note: homeMerchandisingReady
          ? `${catalogReadiness.saleProducts} sale item${catalogReadiness.saleProducts === 1 ? '' : 's'} and ${catalogReadiness.featuredProducts} featured item${catalogReadiness.featuredProducts === 1 ? '' : 's'} help the homepage feel merchandised.`
          : hasCatalog
            ? 'Add sale or featured items so the homepage has stronger buyer-facing hero stories.'
            : 'Add products before the homepage merchandising story can feel complete.',
        context: 'Homepage hero and campaign areas',
      },
      {
        key: 'categories',
        label: 'Category browsing',
        status: categoryReady ? 'Ready' : 'Needs review',
        note:
          categoryReady
            ? `Category browsing is covered across ${categoriesPreview.join(', ')} and the existing department routes.`
            : 'Add products with department coverage so the category pages feel worthwhile to browse.',
        context: 'Women, men, shoes, accessories',
      },
      {
        key: 'search',
        label: 'Search / discovery',
        status: hasSearchableCatalog ? 'Ready' : 'Needs review',
        note:
          hasSearchableCatalog
            ? 'Search can surface products by name, brand, department, category, and SKU.'
            : 'The search experience needs product data before it can feel convincing in a demo.',
        context: 'Search landing and result states',
      },
      {
        key: 'product-detail',
        label: 'Product detail experience',
        status: productDetailReady ? 'Ready' : 'Needs review',
        note:
          productDetailReady
            ? 'Product pages have the merchandising basics needed for a buyer walkthrough.'
            : 'Complete catalog gaps before the product detail experience feels fully launch-ready.',
        context: 'Images, copy, pricing, and details',
      },
      {
        key: 'saved-items',
        label: 'Saved-items / account touchpoints',
        status: savedTouchpointsReady ? 'Ready' : 'Needs review',
        note:
          savedTouchpointsReady
            ? `${analytics.savedTotal} saved item${analytics.savedTotal === 1 ? '' : 's'} and ${analytics.customerCount} customer account${analytics.customerCount === 1 ? '' : 's'} show the account area has activity to preview.`
            : 'Saved-items and account touchpoints exist, but there is no live demo activity yet.',
        context: 'Account and saved-items routes',
      },
      {
        key: 'cart',
        label: 'Cart readiness',
        status: cartReady ? 'Ready' : 'Needs review',
        note:
          cartReady
            ? 'The cart has active catalog items to test and reflects the current storefront inventory story.'
            : 'Add active products with inventory before the cart preview feels complete.',
        context: 'Cart route and mini-cart flow',
      },
      {
        key: 'checkout',
        label: 'Checkout readiness',
        status: 'Render-only',
        note:
          'Checkout is available for review, but it should be treated as render-only or test-mode unless you are intentionally running a checkout QA session.',
        context: 'No live payment testing here',
      },
      {
        key: 'support',
        label: 'Policy / support pages',
        status: policyPagesReady ? 'Ready' : 'Needs review',
        note:
          'Shipping, returns, contact, and privacy pages are in place to support a buyer-facing walkthrough.',
        context: 'Shipping, returns, contact, privacy',
      },
    ];

    const overallStatus = cards.some((card) => card.status === 'Needs review')
      ? 'Needs review'
      : cards.some((card) => card.status === 'Render-only')
        ? 'Render-only'
        : 'Ready';

    const overallNote =
      overallStatus === 'Ready'
        ? 'The storefront is ready for a buyer-side walkthrough, with checkout still treated as test-mode unless intentionally tested.'
        : overallStatus === 'Render-only'
          ? 'The storefront preview is in good shape, but checkout should stay render-only until a deliberate QA pass.'
          : 'Some buyer-facing routes still need product or content review before a launch walkthrough.';

    return {
      cards,
      overallStatus,
      overallNote,
    };
  }, [
    analytics.customerCount,
    analytics.savedTotal,
    catalogReadiness,
    products,
  ]);

  const storeOperationsSnapshot = useMemo(() => {
    const catalogReviewReady = catalogReadiness.totalProducts > 0;
    const productsNeedReview = attentionProducts.length > 0;
    const storefrontReady = storefrontPreview.overallStatus === 'Ready';
    const customerAccountReady = analytics.customerCount > 0 || analytics.savedTotal > 0;
    const savedItemsReady = analytics.savedTotal > 0;

    const cards = [
      {
        key: 'catalog-review',
        label: 'Catalog review',
        status: catalogReviewReady ? 'Ready to review' : 'Needs review',
        note: catalogReviewReady
          ? `${catalogReadiness.totalProducts} product${catalogReadiness.totalProducts === 1 ? '' : 's'} are ready for a quick catalog pass before the next review session.`
          : 'Add products first so the catalog review section has something useful to inspect.',
        context: 'Product list and merchandising',
      },
      {
        key: 'products-attention',
        label: 'Products needing attention',
        status: productsNeedReview ? 'Needs review' : 'Ready to review',
        note: productsNeedReview
          ? `${attentionProducts.length} product${attentionProducts.length === 1 ? '' : 's'} are already flagged by the catalog helper for follow-up.`
          : 'No immediate product issues were flagged by the existing catalog helper.',
        context: 'Existing catalog issues only',
      },
      {
        key: 'storefront-readiness',
        label: 'Storefront readiness',
        status: storefrontReady ? 'Ready to review' : 'Needs review',
        note: storefrontReady
          ? 'The public storefront routes are in a good shape for a seller walkthrough.'
          : 'The storefront still deserves a review pass before it is treated as ready.',
        context: 'Home, search, account, saved, and orders routes',
      },
      {
        key: 'customer-account',
        label: 'Customer/account readiness',
        status: customerAccountReady ? 'Ready to review' : 'Needs review',
        note: customerAccountReady
          ? `${analytics.customerCount} customer account${analytics.customerCount === 1 ? '' : 's'} and ${analytics.savedTotal} saved item${analytics.savedTotal === 1 ? '' : 's'} give the account area real activity to inspect.`
          : 'No customer or saved-item activity is available yet, so account review is limited.',
        context: 'Profile and account routes',
      },
      {
        key: 'saved-items',
        label: 'Saved-items / engagement',
        status: savedItemsReady ? 'Ready to review' : 'Monitor only',
        note: savedItemsReady
          ? `${analytics.savedTotal} saved item${analytics.savedTotal === 1 ? '' : 's'} show customer engagement that can be reviewed today.`
          : 'Saved-items are present, but there is no engagement signal yet, so this area is best watched rather than acted on.',
        context: 'Saved and account touchpoints',
      },
      {
        key: 'orders-monitoring',
        label: 'Orders / read-only monitoring',
        status: 'Monitor only',
        note:
          'Use the customer and admin order routes for review, but keep the posture read-only and avoid implying live order operations.',
        context: ordersSource === 'supabase' ? 'Live Supabase reads' : 'Local demo reads',
      },
      {
        key: 'admin-orders',
        label: 'Admin order prototype',
        status: 'Prototype/read-only',
        note:
          'The admin order surface is a prototype/read-only preview. Live status changes, refunds, fulfillment, and shipping actions remain out of scope.',
        context: 'Admin orders route',
      },
      {
        key: 'checkout-reminder',
        label: 'Checkout test-mode reminder',
        status: 'Future backend work',
        note:
          'Checkout should stay in test-mode or render-only posture until a deliberate production-confidence review is approved.',
        context: 'Checkout and Stripe checklist',
      },
    ];

    const overallStatus = cards.some((card) => card.status === 'Needs review')
      ? 'Needs review'
      : cards.some((card) => card.status === 'Future backend work')
        ? 'Future backend work'
        : cards.some((card) => card.status === 'Prototype/read-only')
          ? 'Prototype/read-only'
          : cards.some((card) => card.status === 'Monitor only')
            ? 'Monitor only'
            : 'Ready to review';

    const overallNote =
      overallStatus === 'Needs review'
        ? 'Start with the catalog and storefront checks, then use the account and order links to confirm the rest of the seller story.'
        : overallStatus === 'Future backend work'
          ? 'The shop is reviewable, but checkout still belongs in a deliberate test-mode or backend-confidence pass.'
          : overallStatus === 'Prototype/read-only'
            ? 'Core store surfaces are reviewable, while the admin order tools stay intentionally read-only.'
            : overallStatus === 'Monitor only'
              ? 'The store is in a watch-and-review posture, with saved-items and orders best treated as signals rather than live operations.'
              : 'The operational snapshot is ready for a business-owner review using existing routes only.';

    return {
      cards,
      overallStatus,
      overallNote,
    };
  }, [
    analytics.customerCount,
    analytics.savedTotal,
    attentionProducts,
    catalogReadiness,
    ordersSource,
    storefrontPreview,
  ]);

  const priorityActions = useMemo(() => {
    const productsNeedLaunchEssentials = attentionProducts.length > 0 || catalogReadiness.productsNeedingAttention > 0;
    const storefrontNeedsReview = storefrontPreview.overallStatus !== 'Ready';
    const accountNeedsReview = analytics.customerCount === 0 && analytics.savedTotal === 0;
    const savedItemsNeedMonitoring = analytics.savedTotal === 0;
    const checkoutShouldStayTestMode = true;

    const cards = [
      {
        key: 'products',
        label: 'Review products that may need launch essentials',
        status: productsNeedLaunchEssentials ? 'High priority' : 'Medium priority',
        note: productsNeedLaunchEssentials
          ? `${attentionProducts.length} product${attentionProducts.length === 1 ? '' : 's'} already need catalog follow-up, so this is the fastest place to start.`
          : 'The catalog is mostly in shape, but a quick launch-essentials pass still makes sense before the next review.',
        context: 'Look for imagery, pricing, and merchandising gaps in the product list.',
        links: [
          { to: '/admin/products', label: 'Open Products', className: 'btn btn-dark' },
        ],
      },
      {
        key: 'storefront',
        label: 'Check storefront preview and readiness',
        status: storefrontNeedsReview ? 'High priority' : 'Medium priority',
        note: storefrontNeedsReview
          ? 'The storefront still has review signals, so confirm the buyer-facing experience before treating it as ready.'
          : 'The storefront reads well today, but a final preview pass is still a practical business-owner check.',
        context: 'Use the public storefront and search routes to confirm the buyer story.',
        links: [
          { to: '/', label: 'Open Storefront', className: 'btn btn-dark' },
          { to: '/search', label: 'Search Catalog' },
        ],
      },
      {
        key: 'checkout',
        label: 'Review checkout and test-mode messaging',
        status: checkoutShouldStayTestMode ? 'Future backend work' : 'Monitor',
        note:
          'Checkout messaging should continue to read as test-mode or render-only, with no suggestion that production payment operations are active.',
        context: 'Keep the message honest without changing checkout behavior.',
        links: [
          { to: '/admin/orders', label: 'Review Orders' },
        ],
      },
      {
        key: 'account',
        label: 'Review customer account and profile readiness',
        status: accountNeedsReview ? 'High priority' : 'Medium priority',
        note: accountNeedsReview
          ? 'There is little customer activity to review, so the account story still needs attention before it feels fully useful.'
          : `${analytics.customerCount} customer account${analytics.customerCount === 1 ? '' : 's'} and ${analytics.savedTotal} saved item${analytics.savedTotal === 1 ? '' : 's'} make the account area worth checking.`,
        context: 'Confirm profile and account routes still read clearly.',
        links: [
          { to: '/account', label: 'Open Account', className: 'btn btn-dark' },
          { to: '/saved', label: 'Open Saved Items' },
        ],
      },
      {
        key: 'saved-items',
        label: 'Review saved-items and engagement readiness',
        status: savedItemsNeedMonitoring ? 'Monitor' : 'Medium priority',
        note: savedItemsNeedMonitoring
          ? 'Saved-items is worth watching, but there is no active engagement signal in the current data set yet.'
          : 'Saved-items activity is present, so it is worth a quick look as part of the customer engagement review.',
        context: 'Use this as a read-only engagement signal, not a live task queue.',
        links: [
          { to: '/saved', label: 'Open Saved Items', className: 'btn btn-dark' },
        ],
      },
      {
        key: 'orders',
        label: 'Monitor read-only order history and admin order prototype areas',
        status: 'Monitor',
        note:
          'Use the order views to review status and activity, but keep the posture read-only and avoid implying live admin order operations.',
        context: ordersSource === 'supabase' ? 'Live Supabase reads for admin review only.' : 'Local demo reads for admin review only.',
        links: [
          { to: '/admin/orders', label: 'Admin Orders', className: 'btn btn-dark' },
          { to: '/orders', label: 'Customer Orders' },
        ],
      },
      {
        key: 'fulfillment',
        label: 'Confirm no live fulfillment or refund action is implied',
        status: 'Future backend work',
        note:
          'The UI should continue to signal that fulfillment, refunds, and similar actions are not implemented as live operations.',
        context: 'Keep prototype and backend boundaries explicit.',
        links: [
          { to: '/admin/orders', label: 'Recheck Order UI' },
        ],
      },
    ];

    const overallStatus = cards.some((card) => card.status === 'High priority')
      ? 'High priority'
      : cards.some((card) => card.status === 'Medium priority')
        ? 'Medium priority'
        : cards.some((card) => card.status === 'Monitor')
          ? 'Monitor'
          : 'Future backend work';

    const overallNote =
      overallStatus === 'High priority'
        ? 'Start with products and storefront checks, then verify account and order review areas stay read-only.'
        : overallStatus === 'Medium priority'
          ? 'The store is in good shape overall, but a few practical review items still deserve attention.'
          : overallStatus === 'Monitor'
            ? 'The main job here is ongoing review, not action-taking or backend mutation.'
            : 'The remaining work is backend-bound, so the admin view should keep signaling that boundary clearly.';

    return {
      cards,
      overallStatus,
      overallNote,
    };
  }, [
    analytics.customerCount,
    analytics.savedTotal,
    attentionProducts.length,
    catalogReadiness.productsNeedingAttention,
    ordersSource,
    storefrontPreview.overallStatus,
  ]);

  const weeklyStoreReview = useMemo(() => {
    const hasProducts = catalogReadiness.totalProducts > 0;
    const storefrontReady = storefrontPreview.overallStatus === 'Ready';
    const accountReady = analytics.customerCount > 0 || analytics.savedTotal > 0;
    const savedItemsReady = analytics.savedTotal > 0;

    const cards = [
      {
        key: 'products',
        label: 'Review product readiness and launch essentials',
        status: 'Weekly review',
        note: hasProducts
          ? `${attentionProducts.length} product${attentionProducts.length === 1 ? '' : 's'} still deserve a weekly launch-essentials pass.`
          : 'Start here if the catalog is thin, because product readiness drives the rest of the weekly review.',
        context: 'Look for imagery, pricing, and merchandising gaps in the catalog.',
        links: [{ to: '/admin/products', label: 'Open Products', className: 'btn btn-dark' }],
      },
      {
        key: 'storefront',
        label: 'Check storefront presentation and buyer-facing routes',
        status: 'Buyer-facing',
        note: storefrontReady
          ? 'The storefront reads cleanly this week, so a quick route check is enough to confirm the buyer-facing story.'
          : 'The storefront still needs buyer-facing attention, especially around presentation and route consistency.',
        context: 'Use the public store, search, and category routes.',
        links: [
          { to: '/', label: 'Open Storefront', className: 'btn btn-dark' },
          { to: '/search', label: 'Search Catalog' },
        ],
      },
      {
        key: 'account',
        label: 'Review customer account and profile messaging',
        status: 'Admin readiness',
        note: accountReady
          ? `${analytics.customerCount} customer account${analytics.customerCount === 1 ? '' : 's'} and ${analytics.savedTotal} saved item${analytics.savedTotal === 1 ? '' : 's'} are available for a weekly account check.`
          : 'Account and profile messaging should still be reviewed so the admin story stays clear even when data is light.',
        context: 'Keep the customer-facing account copy honest and readable.',
        links: [
          { to: '/account', label: 'Open Account', className: 'btn btn-dark' },
          { to: '/saved', label: 'Saved Items' },
        ],
      },
      {
        key: 'saved-items',
        label: 'Review saved-items and engagement readiness',
        status: savedItemsReady ? 'Admin readiness' : 'Monitor only',
        note: savedItemsReady
          ? 'Saved-items activity is present, so a weekly check can confirm the customer engagement signals still make sense.'
          : 'Saved-items should be monitored weekly, even if the current data set does not show active engagement yet.',
        context: 'Use it as a read-only engagement signal, not a task queue.',
        links: [{ to: '/saved', label: 'Open Saved Items', className: 'btn btn-dark' }],
      },
      {
        key: 'orders',
        label: 'Monitor read-only order history and admin order prototype areas',
        status: 'Monitor only',
        note:
          'Weekly order review should stay read-only and should not imply live admin order operations, refunds, or fulfillment actions.',
        context: ordersSource === 'supabase' ? 'Live Supabase reads only.' : 'Local demo reads only.',
        links: [
          { to: '/admin/orders', label: 'Admin Orders', className: 'btn btn-dark' },
          { to: '/orders', label: 'Customer Orders' },
        ],
      },
      {
        key: 'checkout',
        label: 'Reconfirm checkout and future backend work messaging',
        status: 'Future backend work',
        note:
          'A weekly check should keep checkout/test-mode copy honest and keep future backend work visible for fulfillment, refunds, and order mutation.',
        context: 'Do not imply live payment, refund, or shipping purchase behavior.',
        links: [{ to: '/admin/orders', label: 'Review Checkout Context' }],
      },
    ];

    const overallStatus = cards.some((card) => card.status === 'Buyer-facing')
      ? 'Buyer-facing'
      : cards.some((card) => card.status === 'Admin readiness')
        ? 'Admin readiness'
        : cards.some((card) => card.status === 'Monitor only')
          ? 'Monitor only'
          : 'Future backend work';

    const overallNote =
      overallStatus === 'Buyer-facing'
        ? 'Use the weekly review to make sure the storefront presentation stays credible to shoppers.'
        : overallStatus === 'Admin readiness'
          ? 'The weekly rhythm is healthy, with the admin and customer-facing areas still worth a quick check.'
          : overallStatus === 'Monitor only'
            ? 'The weekly job is mostly observation and confirmation, not operational action.'
            : 'The remaining weekly concern is backend-bound, so the admin view should keep that boundary explicit.';

    return {
      cards,
      overallStatus,
      overallNote,
    };
  }, [
    analytics.customerCount,
    analytics.savedTotal,
    attentionProducts.length,
    catalogReadiness.totalProducts,
    ordersSource,
    storefrontPreview.overallStatus,
  ]);

  const storeHealthSummary = useMemo(() => {
    const catalogHealthy = catalogReadiness.totalProducts > 0 && catalogReadiness.productsNeedingAttention === 0;
    const storefrontHealthy = storefrontPreview.overallStatus === 'Ready';
    const accountHealthy = analytics.customerCount > 0;
    const savedItemsHealthy = analytics.savedTotal > 0;

    const cards = [
      {
        key: 'catalog',
        label: 'Catalog health',
        status: catalogHealthy ? 'Healthy' : 'Needs review',
        note: catalogHealthy
          ? 'Catalog data is in good shape for a business-owner review, with no obvious readiness gaps flagged.'
          : catalogReadiness.totalProducts === 0
            ? 'The catalog still needs product data before it can feel healthy.'
            : `${catalogReadiness.productsNeedingAttention} product${catalogReadiness.productsNeedingAttention === 1 ? '' : 's'} still need attention before the catalog feels healthy.`,
        context: 'Existing product data and merchandising signals.',
        links: [{ to: '/admin/products', label: 'Review Products', className: 'btn btn-dark' }],
      },
      {
        key: 'storefront',
        label: 'Storefront presentation',
        status: storefrontHealthy ? 'Healthy' : 'Needs review',
        note: storefrontHealthy
          ? 'The buyer-facing storefront reads well today and supports a clean review path.'
          : 'The storefront still deserves a review pass before it should be treated as healthy.',
        context: 'Homepage, search, and public route presentation.',
        links: [
          { to: '/', label: 'Open Storefront', className: 'btn btn-dark' },
          { to: '/search', label: 'Search Catalog' },
        ],
      },
      {
        key: 'account',
        label: 'Customer/account readiness',
        status: accountHealthy ? 'Healthy' : 'Needs review',
        note: accountHealthy
          ? `${analytics.customerCount} customer account${analytics.customerCount === 1 ? '' : 's'} help the account experience feel real and reviewable.`
          : 'Customer/account messaging still needs review because there is little live activity to reference.',
        context: 'Profile and account routes remain advisory only.',
        links: [
          { to: '/account', label: 'Open Account', className: 'btn btn-dark' },
          { to: '/saved', label: 'Saved Items' },
        ],
      },
      {
        key: 'saved-items',
        label: 'Saved-items engagement',
        status: savedItemsHealthy ? 'Healthy' : 'Monitor',
        note: savedItemsHealthy
          ? `${analytics.savedTotal} saved item${analytics.savedTotal === 1 ? '' : 's'} give the engagement area a clear signal to review.`
          : 'Saved-items is still useful to monitor, even if the current data set does not show active engagement yet.',
        context: 'Saved-items and engagement signals only.',
        links: [{ to: '/saved', label: 'Open Saved Items', className: 'btn btn-dark' }],
      },
      {
        key: 'checkout',
        label: 'Checkout / test-mode readiness',
        status: 'Future backend work',
        note:
          'Checkout should continue to read as test-mode or render-only until deliberate backend work is approved.',
        context: 'Do not imply live payment, refund, or shipping purchase behavior.',
        links: [{ to: '/admin/orders', label: 'Review Order Context' }],
      },
      {
        key: 'orders',
        label: 'Order visibility / read-only monitoring',
        status: 'Monitor',
        note:
          'Orders should be reviewed as read-only signals, with no suggestion that live admin order operations are active.',
        context: ordersSource === 'supabase' ? 'Live Supabase reads only.' : 'Local demo reads only.',
        links: [
          { to: '/admin/orders', label: 'Admin Orders', className: 'btn btn-dark' },
          { to: '/orders', label: 'Customer Orders' },
        ],
      },
      {
        key: 'admin-ops',
        label: 'Admin operations prototype',
        status: 'Prototype/read-only',
        note:
          'The admin operations surface is still a prototype/read-only area. Live mutation behavior remains out of scope.',
        context: 'Prototype order review only.',
        links: [{ to: '/admin/orders', label: 'Open Admin Orders', className: 'btn btn-dark' }],
      },
      {
        key: 'future-work',
        label: 'Future backend operations work',
        status: 'Future backend work',
        note:
          'Live fulfillment, refunds, shipping purchase, and other backend operations should remain clearly framed as future work.',
        context: 'Keep the boundary explicit for review and handoff.',
        links: [{ to: '/admin', label: 'Open Dashboard', className: 'btn btn-dark' }],
      },
    ];

    const overallStatus = cards.some((card) => card.status === 'Needs review')
      ? 'Needs review'
      : cards.some((card) => card.status === 'Future backend work')
        ? 'Future backend work'
        : cards.some((card) => card.status === 'Prototype/read-only')
          ? 'Prototype/read-only'
          : cards.some((card) => card.status === 'Monitor')
            ? 'Monitor'
            : 'Healthy';

    const overallNote =
      overallStatus === 'Healthy'
        ? 'The store reads as healthy for a business-owner review, with only intentional prototype and backend boundaries left to watch.'
        : overallStatus === 'Needs review'
          ? 'Some buyer-facing or catalog areas still need attention before the store feels healthy.'
          : overallStatus === 'Prototype/read-only'
            ? 'The storefront is reviewable, but admin operations should still be treated as prototype/read-only.'
            : overallStatus === 'Monitor'
              ? 'The store is in a monitoring posture, with the main job being review and confirmation rather than action.'
              : 'The remaining work is backend-bound, so the admin view should keep that boundary explicit.';

    return {
      cards,
      overallStatus,
      overallNote,
    };
  }, [
    analytics.customerCount,
    analytics.savedTotal,
    catalogReadiness.productsNeedingAttention,
    catalogReadiness.totalProducts,
    ordersSource,
    storefrontPreview.overallStatus,
  ]);

  const sellerLaunchCommandCenter = useMemo(() => {
    const hasProducts = catalogReadiness.totalProducts > 0;
    const productLaunchReady =
      hasProducts &&
      catalogReadiness.productsNeedingAttention === 0 &&
      catalogReadiness.lowStockProducts === 0 &&
      catalogReadiness.outOfStockProducts === 0;
    const customerPersistenceReady = analytics.customerCount > 0;
    const savedItemsReady = analytics.savedTotal > 0;

    const cards = [
      {
        key: 'store',
        label: 'Store readiness',
        status: storeReadiness.overallStatus,
        note: storeReadiness.overallNote,
        context: 'Admin dashboard summary',
      },
      {
        key: 'products',
        label: 'Product launch readiness',
        status: productLaunchReady ? 'Ready' : 'Needs review',
        note: productLaunchReady
          ? 'Catalog, pricing, merchandising, and stock signals are lined up for a seller launch story.'
          : hasProducts
            ? `${catalogReadiness.productsNeedingAttention} product${catalogReadiness.productsNeedingAttention === 1 ? '' : 's'} still need launch review before the catalog feels pitch-ready.`
            : 'Add products before the product-launch story can feel complete.',
        context: 'Admin products and editor',
      },
      {
        key: 'preview',
        label: 'Storefront preview readiness',
        status: storefrontPreview.overallStatus,
        note: storefrontPreview.overallNote,
        context: 'Buyer-side routes',
      },
      {
        key: 'checkout',
        label: 'Checkout / test-mode readiness',
        status: 'Future backend work',
        note:
          'Checkout renders today, but it should stay test-mode or render-only until a deliberate production-confidence pass is approved.',
        context: 'Checkout route and Stripe checklist',
      },
      {
        key: 'account',
        label: 'Account/customer persistence readiness',
        status: customerPersistenceReady ? 'Ready' : 'Needs review',
        note: customerPersistenceReady
          ? `${analytics.customerCount} customer account${analytics.customerCount === 1 ? '' : 's'} are available for profile and account demos.`
          : 'No customer accounts are present yet, so the seller story needs more demo data.',
        context: 'Profile and account routes',
      },
      {
        key: 'saved-items',
        label: 'Saved-items persistence readiness',
        status: savedItemsReady ? 'Ready' : 'Needs review',
        note: savedItemsReady
          ? `${analytics.savedTotal} saved item${analytics.savedTotal === 1 ? '' : 's'} confirm persistence is showing up in the demo data.`
          : 'Saved-items persistence is implemented, but the current data set has no saved items to show.',
        context: 'Saved items and account touchpoints',
      },
      {
        key: 'order-history',
        label: 'Order history / read-only readiness',
        status: 'Prototype/read-only',
        note:
          orders.length > 0
            ? 'Customer and admin order history are visible for review, but the surface remains read-only.'
            : 'The order-history surface is in place, but there are no demo orders yet.',
        context: ordersSource === 'supabase' ? 'Live Supabase reads' : 'Local demo reads',
      },
      {
        key: 'admin-orders',
        label: 'Admin order operations status',
        status: 'Prototype/read-only',
        note:
          'The admin order tools are preview-only. Live status changes, refunds, and fulfillment actions are future backend work.',
        context: 'Admin orders route',
      },
    ];

    const readyCount = cards.filter((card) => card.status === 'Ready').length;
    const reviewCount = cards.filter((card) => card.status === 'Needs review').length;
    const prototypeCount = cards.filter((card) => card.status === 'Prototype/read-only').length;
    const futureCount = cards.filter((card) => card.status === 'Future backend work').length;
    const summary = [
      { key: 'ready', label: 'Buyer-ready', value: readyCount },
      { key: 'review', label: 'Needs review', value: reviewCount },
      { key: 'prototype', label: 'Prototype/read-only', value: prototypeCount },
      { key: 'future', label: 'Future backend work', value: futureCount },
    ];

    const overallStatus = reviewCount
      ? 'Needs review'
      : prototypeCount
        ? 'Prototype/read-only'
        : futureCount
          ? 'Future backend work'
          : 'Ready';

    const overallNote =
      overallStatus === 'Ready'
        ? 'The seller launch command center reads as ready for a business-owner walkthrough.'
        : overallStatus === 'Prototype/read-only'
          ? 'The storefront is ready to pitch, but order operations remain intentionally read-only.'
          : overallStatus === 'Future backend work'
            ? 'The storefront is close, but checkout still needs deliberate production-confidence work.'
            : 'The launch story still has product or storefront gaps that should be cleaned up before a pitch.';

    return {
      cards,
      summary,
      readyCount,
      reviewCount,
      prototypeCount,
      futureCount,
      overallStatus,
      overallNote,
    };
  }, [
    analytics.customerCount,
    analytics.savedTotal,
    catalogReadiness.lowStockProducts,
    catalogReadiness.outOfStockProducts,
    catalogReadiness.productsNeedingAttention,
    catalogReadiness.totalProducts,
    orders.length,
    ordersSource,
    storefrontPreview,
    storeReadiness,
  ]);

  const launchQANotes = useMemo(() => {
    const cards = [
      {
        key: 'storefront',
        label: 'Storefront review',
        status: storefrontPreview.overallStatus,
        note:
          storefrontPreview.overallStatus === 'Ready'
            ? 'Walk the home page, category browsing, search, and sale pages like a buyer would and confirm the merchandising story feels complete.'
            : 'Fix buyer-facing merch gaps first, then re-check the home page, category browsing, and search story before a launch.',
        context: 'Use the storefront and category routes',
      },
      {
        key: 'catalog',
        label: 'Product / catalog review',
        status: storeReadiness.overallStatus,
        note:
          storeReadiness.overallStatus === 'Ready'
            ? 'Confirm products have names, images, pricing, stock, and merchandising details that make the catalog feel pitch-ready.'
            : 'Review flagged products and close obvious catalog gaps before treating the launch as seller-ready.',
        context: 'Use admin products and editor views',
      },
      {
        key: 'checkout',
        label: 'Checkout test-mode review',
        status: 'Future backend work',
        note:
          'Open checkout only as a render-only or test-mode pass unless a deliberate payment QA session is in progress. Do not treat it as production-ready.',
        context: 'Checkout route only',
      },
      {
        key: 'account',
        label: 'Customer account / profile review',
        status: sellerLaunchCommandCenter.cards.find((item) => item.key === 'account')?.status ?? 'Needs review',
        note:
          'Check that profile details, account access, and the seller story for customer persistence still read clearly in the account area.',
        context: 'Use the account routes',
      },
      {
        key: 'saved-items',
        label: 'Saved-items review',
        status: sellerLaunchCommandCenter.cards.find((item) => item.key === 'saved-items')?.status ?? 'Needs review',
        note:
          'Confirm saved items are visible in the seller story and that the local/demo fallback still makes sense when the list is empty.',
        context: 'Use the saved-items route',
      },
      {
        key: 'orders',
        label: 'Order history / read-only review',
        status: 'Prototype/read-only',
        note:
          orders.length > 0
            ? 'Review customer and admin order history for clarity, but keep it read-only and avoid implying live fulfillment tools are present.'
            : 'The order-history surface is present, but there are no demo orders yet to review.',
        context: 'Use account orders and admin orders',
      },
      {
        key: 'admin-orders',
        label: 'Admin order prototype review',
        status: 'Prototype/read-only',
        note:
          'Check the admin orders prototype for review context only. Live status changes, refunds, and fulfillment actions remain future backend work.',
        context: 'Use the admin orders route',
      },
    ];

    const overallStatus = cards.some((card) => card.status === 'Needs review')
      ? 'Needs review'
      : cards.some((card) => card.status === 'Prototype/read-only')
        ? 'Prototype/read-only'
        : cards.some((card) => card.status === 'Future backend work')
          ? 'Future backend work'
          : 'Ready';

    const overallNote =
      overallStatus === 'Ready'
        ? 'These notes are ready to use as a local launch smoke test before a future release batch.'
        : overallStatus === 'Prototype/read-only'
          ? 'The launch paths are visible, but order review and admin order tools remain intentionally read-only.'
          : overallStatus === 'Future backend work'
            ? 'Checkout still needs future production-confidence work before any launch batch is worth spending credits on.'
            : 'Some storefront or catalog areas still need review before the launch notes can read as fully ready.';

    return {
      cards,
      overallStatus,
      overallNote,
    };
  }, [
    orders.length,
    sellerLaunchCommandCenter.cards,
    storeReadiness.overallStatus,
    storefrontPreview.overallStatus,
  ]);

  const launchReleaseNotes = useMemo(() => {
    const cards = [
      {
        key: 'buyer-facing',
        label: 'Buyer-facing ready',
        status: 'Ready',
        note:
          'Storefront browsing, product detail pages, saved-items touchpoints, and customer account surfaces are in place for a buyer-side walkthrough.',
        context: 'Storefront, account, and saved-items routes',
      },
      {
        key: 'seller-support',
        label: 'Seller/admin readiness support',
        status: 'Ready',
        note:
          'The store-readiness dashboard, product launch checklist, product editor guidance, seller launch command center, and QA notes all support launch prep.',
        context: 'Admin dashboard and product routes',
      },
      {
        key: 'prototype',
        label: 'Prototype / read-only',
        status: 'Prototype/read-only',
        note:
          'Order history and admin order operations are still review surfaces only; they are useful for demos but do not include live mutation or fulfillment controls.',
        context: 'Account orders and admin orders',
      },
      {
        key: 'future',
        label: 'Future backend work',
        status: 'Future backend work',
        note:
          'Checkout/test-mode confidence, live order mutation, refunds, and fulfillment remain future backend work and should stay out of launch promises for now.',
        context: 'Checkout and Stripe readiness',
      },
    ];

    const overallStatus = 'Ready';
    const overallNote =
      'Recent readiness work is centered on buyer-facing polish, seller launch support, and honest prototype boundaries so a batched release can be planned safely.';

    return {
      cards,
      overallStatus,
      overallNote,
    };
  }, []);

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

      <section className="admin-dashboard-panel admin-dashboard-panel-soft admin-launch-command-center-panel">
        <div className="admin-dashboard-section-heading">
          <span>Seller launch command center</span>
          <p>
            One place for a store owner to see what is buyer-ready, what needs review, what remains
            prototype-only, and what still needs future backend work before launch.
          </p>
        </div>

        <div className="admin-launch-command-center-summary-grid">
          {sellerLaunchCommandCenter.summary.map((item) => (
            <div key={item.key} className="admin-launch-command-center-stat">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        <div className="admin-readiness-grid admin-launch-command-center-grid">
          {sellerLaunchCommandCenter.cards.map((item) => (
            <ReadinessCard
              key={item.key}
              label={item.label}
              status={item.status}
              note={item.note}
              context={item.context}
            />
          ))}
        </div>

        <div className="admin-launch-command-center-footer">
          <div className="admin-launch-command-center-summary">
            <span className={`status-badge ${getReadinessTone(sellerLaunchCommandCenter.overallStatus)}`.trim()}>
              {sellerLaunchCommandCenter.overallStatus}
            </span>
            <p>{sellerLaunchCommandCenter.overallNote}</p>
          </div>

          <p className="admin-launch-command-center-note">
            Recommended next steps: clear any flagged products, walk the storefront from the buyer side, and keep
            checkout plus order operations in test-mode or read-only review until backend work is approved.
          </p>

          <div className="admin-launch-command-center-actions">
            <Link to="/admin" className="btn btn-dark">
              Open Dashboard
            </Link>
            <Link to="/admin/products" className="btn btn-ghost">
              Manage Products
            </Link>
            <Link to="/admin/orders" className="btn btn-ghost">
              Review Orders
            </Link>
            <Link to="/" className="btn btn-outline">
              View Storefront
            </Link>
            <Link to="/search?q=sale" className="btn btn-outline">
              Test Search
            </Link>
            <Link to="/women" className="btn btn-outline">
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      <section className="admin-dashboard-panel admin-dashboard-panel-soft admin-launch-qa-panel">
        <div className="admin-dashboard-section-heading">
          <span>Launch QA notes</span>
          <p>
            A lightweight local smoke-test checklist for a store owner or admin before batching this work into a
            future release.
          </p>
        </div>

        <div className="admin-launch-qa-grid">
          {launchQANotes.cards.map((item) => (
            <LaunchQANoteCard
              key={item.key}
              label={item.label}
              status={item.status}
              note={item.note}
              context={item.context}
            />
          ))}
        </div>

        <div className="admin-launch-qa-footer">
          <div className="admin-launch-command-center-summary">
            <span className={`status-badge ${getReadinessTone(launchQANotes.overallStatus)}`.trim()}>
              {launchQANotes.overallStatus}
            </span>
            <p>{launchQANotes.overallNote}</p>
          </div>

          <p className="admin-launch-command-center-note">
            Suggested smoke-test flow: storefront, products, checkout test-mode, account profile, saved items,
            customer order history, and admin order prototype review.
          </p>

          <div className="admin-launch-qa-actions">
            <Link to="/" className="btn btn-dark">
              View Storefront
            </Link>
            <Link to="/admin/products" className="btn btn-ghost">
              Review Catalog
            </Link>
            <Link to="/checkout" className="btn btn-ghost">
              Open Checkout
            </Link>
            <Link to="/account" className="btn btn-outline">
              Check Account
            </Link>
            <Link to="/account/saved" className="btn btn-outline">
              Saved Items
            </Link>
            <Link to="/admin/orders" className="btn btn-outline">
              Admin Orders
            </Link>
          </div>
        </div>
      </section>

      <section className="admin-dashboard-panel admin-dashboard-panel-soft admin-launch-release-notes-panel">
        <div className="admin-dashboard-section-heading">
          <span>Launch release notes</span>
          <p>
            A short summary of what changed for launch readiness and where the work is intentionally still
            advisory or read-only.
          </p>
        </div>

        <div className="admin-launch-release-note-grid">
          {launchReleaseNotes.cards.map((item) => (
            <LaunchReleaseNoteCard
              key={item.key}
              label={item.label}
              status={item.status}
              note={item.note}
              context={item.context}
            />
          ))}
        </div>

        <div className="admin-launch-release-notes-footer">
          <div className="admin-launch-command-center-summary">
            <span className={`status-badge ${getReadinessTone(launchReleaseNotes.overallStatus)}`.trim()}>
              {launchReleaseNotes.overallStatus}
            </span>
            <p>{launchReleaseNotes.overallNote}</p>
          </div>

          <p className="admin-launch-command-center-note">
            Use this as a quick reminder of the current launch posture before batching future PRs or spending
            release credits.
          </p>

          <div className="admin-launch-release-notes-actions">
            <Link to="/admin" className="btn btn-dark">
              Open Dashboard
            </Link>
            <Link to="/admin/products" className="btn btn-ghost">
              Product Readiness
            </Link>
            <Link to="/admin/orders" className="btn btn-ghost">
              Review Orders
            </Link>
            <Link to="/" className="btn btn-outline">
              View Storefront
            </Link>
          </div>
        </div>
      </section>

      <section className="admin-dashboard-panel admin-dashboard-panel-soft admin-store-readiness-panel">
        <div className="admin-dashboard-section-heading">
          <span>Store readiness</span>
          <p>
            A store-owner view of whether the shop looks ready to sell, using existing catalog, account, and order data only.
          </p>
        </div>

        <div className="admin-readiness-grid admin-store-readiness-grid">
          {storeReadiness.cards.map((item) => (
            <ReadinessCard
              key={item.key}
              label={item.label}
              status={item.status}
              note={item.note}
              context={item.context}
            />
          ))}
        </div>

        <div className="admin-store-readiness-footer">
          <span className={`status-badge ${getReadinessTone(storeReadiness.overallStatus)}`.trim()}>
            {storeReadiness.overallStatus}
          </span>
          <p>{storeReadiness.overallNote}</p>
        </div>

        <div className="admin-cta-row">
          <Link to="/admin/products" className="btn btn-dark">
            Manage Products
          </Link>
          <Link to="/admin/orders" className="btn btn-ghost">
            Review Orders
          </Link>
          <Link to="/admin/customers" className="btn btn-ghost">
            View Customers
          </Link>
          <Link to="/" className="btn btn-outline">
            Check Storefront
          </Link>
        </div>
      </section>

      <section className="admin-dashboard-panel admin-storefront-preview-panel">
        <div className="admin-dashboard-section-heading">
          <span>Storefront preview checklist</span>
          <p>
            A buyer-side readiness view of the storefront using existing routes and catalog data only.
          </p>
        </div>

        <div className="admin-readiness-grid admin-storefront-preview-grid">
          {storefrontPreview.cards.map((item) => (
            <StorefrontPreviewCard
              key={item.key}
              label={item.label}
              status={item.status}
              note={item.note}
              context={item.context}
            />
          ))}
        </div>

        <div className="admin-storefront-preview-footer">
          <span className={`status-badge ${getStorefrontPreviewTone(storefrontPreview.overallStatus)}`.trim()}>
            {storefrontPreview.overallStatus}
          </span>
          <p>{storefrontPreview.overallNote}</p>
        </div>

        <div className="admin-storefront-preview-actions">
          <Link to="/" className="btn btn-dark">
            View Storefront
          </Link>
          <Link to="/women" className="btn btn-ghost">
            View Categories
          </Link>
          <Link to="/search?q=sale" className="btn btn-ghost">
            Test Search
          </Link>
          <Link to="/sale" className="btn btn-ghost">
            View Sale Page
          </Link>
          <Link to="/shipping" className="btn btn-outline">
            Review Shipping / Returns / Contact
          </Link>
        </div>
      </section>

      <section className="admin-dashboard-panel admin-store-operations-snapshot-panel">
        <div className="admin-dashboard-section-heading">
          <span>Store operations snapshot</span>
          <p>
            A compact business-owner review queue for what to look at today. It stays advisory only and uses existing
            routes and existing data.
          </p>
        </div>

        <div className="admin-readiness-grid admin-store-operations-snapshot-grid">
          {storeOperationsSnapshot.cards.map((item) => (
            <ReadinessCard
              key={item.key}
              label={item.label}
              status={item.status}
              note={item.note}
              context={item.context}
            />
          ))}
        </div>

        <div className="admin-store-operations-snapshot-footer">
          <span className={`status-badge ${getReadinessTone(storeOperationsSnapshot.overallStatus)}`.trim()}>
            {storeOperationsSnapshot.overallStatus}
          </span>
          <p>{storeOperationsSnapshot.overallNote}</p>
        </div>

        <div className="admin-cta-row">
          <Link to="/admin/products" className="btn btn-dark">
            Review Products
          </Link>
          <Link to="/admin/orders" className="btn btn-ghost">
            Review Admin Orders
          </Link>
          <Link to="/" className="btn btn-ghost">
            Open Storefront
          </Link>
          <Link to="/search" className="btn btn-ghost">
            Search Catalog
          </Link>
          <Link to="/account" className="btn btn-ghost">
            Open Account
          </Link>
          <Link to="/saved" className="btn btn-ghost">
            Open Saved Items
          </Link>
          <Link to="/orders" className="btn btn-outline">
            Open Orders
          </Link>
        </div>
      </section>

      <section className="admin-dashboard-panel admin-priority-actions-panel">
        <div className="admin-dashboard-section-heading">
          <span>Priority actions</span>
          <p>
            A short action list for what to review first. It stays advisory only and points to existing routes only.
          </p>
        </div>

        <div className="admin-priority-actions-grid">
          {priorityActions.cards.map((item) => (
            <PriorityActionCard
              key={item.key}
              label={item.label}
              status={item.status}
              note={item.note}
              context={item.context}
              links={item.links}
            />
          ))}
        </div>

        <div className="admin-priority-actions-footer">
          <span className={`status-badge ${getPriorityTone(priorityActions.overallStatus)}`.trim()}>
            {priorityActions.overallStatus}
          </span>
          <p>{priorityActions.overallNote}</p>
        </div>
      </section>

      <section className="admin-dashboard-panel admin-weekly-review-panel">
        <div className="admin-dashboard-section-heading">
          <span>Weekly store review</span>
          <p>
            A simple once-a-week operating rhythm for keeping the store healthy. It stays advisory only and uses
            existing routes only.
          </p>
        </div>

        <div className="admin-weekly-review-grid">
          {weeklyStoreReview.cards.map((item) => (
            <WeeklyReviewCard
              key={item.key}
              label={item.label}
              status={item.status}
              note={item.note}
              context={item.context}
              links={item.links}
            />
          ))}
        </div>

        <div className="admin-weekly-review-footer">
          <span className={`status-badge ${getWeeklyReviewTone(weeklyStoreReview.overallStatus)}`.trim()}>
            {weeklyStoreReview.overallStatus}
          </span>
          <p>{weeklyStoreReview.overallNote}</p>
        </div>
      </section>

      <section className="admin-dashboard-panel admin-health-summary-panel">
        <div className="admin-dashboard-section-heading">
          <span>Store health summary</span>
          <p>
            A compact business-owner overview that rolls the snapshot, priorities, and weekly review into one place.
          </p>
        </div>

        <div className="admin-health-summary-grid">
          {storeHealthSummary.cards.map((item) => (
            <HealthSummaryCard
              key={item.key}
              label={item.label}
              status={item.status}
              note={item.note}
              context={item.context}
              links={item.links}
            />
          ))}
        </div>

        <div className="admin-health-summary-footer">
          <span className={`status-badge ${getHealthSummaryTone(storeHealthSummary.overallStatus)}`.trim()}>
            {storeHealthSummary.overallStatus}
          </span>
          <p>{storeHealthSummary.overallNote}</p>
        </div>
      </section>

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
                  : 'Core numbers and demo signals pulled from the current local product and order state.'}
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

          <div className="admin-dashboard-mini-grid">
            <div className="admin-dashboard-panel admin-dashboard-panel-soft">
            <div className="admin-dashboard-section-heading compact">
              <span>Order activity</span>
              <p>Where the queue is concentrated right now and what should be checked first.</p>
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
              <p>Products needing attention versus healthy stock, at a glance.</p>
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
                to="/admin/products"
                label="Manage Products"
                description="Review catalog health and update listings."
                className="btn btn-dark"
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
                to="/"
                label="Check Storefront"
                description="See the public shop experience."
              />
              <QuickActionLink
                to="/admin/products/new"
                label="Add Product"
                description="Create a new catalog item."
              />
            </div>
          </section>

          <section className="admin-dashboard-panel">
            <div className="admin-dashboard-section-heading compact">
              <span>Needs attention</span>
              <p>
                {attentionProducts.length
                  ? 'A short list of product fixes to handle before screenshots, demos, or release prep. Each card points to the most obvious merchandising gap first.'
                  : catalogReadiness.totalProducts === 0
                    ? 'No products are in the catalog yet, so the readiness panel will stay quiet until the first item is added.'
                    : catalogReadiness.productsNeedingAttention === 0
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
