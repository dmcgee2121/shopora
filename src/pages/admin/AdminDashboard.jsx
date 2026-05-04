import { Link } from 'react-router-dom';
import CatalogStatusNote from '../../components/CatalogStatusNote';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';

export default function AdminDashboard() {
  const { users } = useAuth();
  const { orders } = useOrders();
  const { products } = useProductCatalog();

  const saleProducts = products.filter((product) => product.isSale).length;
  const lowStockProducts = products.filter((product) => product.stockCount > 0 && product.stockCount < 8).length;
  const outOfStockProducts = products.filter((product) => product.stockCount <= 0).length;
  const inStockProducts = products.filter((product) => product.stockCount >= 8).length;
  const customerCount = users.filter((user) => user.role !== 'admin').length;
  const savedTotal = users.reduce((total, user) => total + (user.savedProductIds?.length ?? 0), 0);
  const lowStockItems = products.filter((product) => product.stockCount > 0 && product.stockCount < 8).slice(0, 4);
  const outOfStockItems = products.filter((product) => product.stockCount <= 0).slice(0, 4);
  const catalogHighlights = products
    .filter((product) => product.isNew || product.isSale)
    .slice(0, 3);
  const orderedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const pendingOrders = orderedOrders.filter((order) => order.status === 'Pending').length;
  const demoRevenueTotal = orderedOrders
    .filter((order) => order.status !== 'Cancelled')
    .reduce((total, order) => total + order.total, 0);
  const latestOrder = orderedOrders[0] ?? null;

  const cards = [
    { label: 'Total products', value: products.length },
    { label: 'Sale products', value: saleProducts },
    { label: 'Low stock', value: lowStockProducts },
    { label: 'Out of stock', value: outOfStockProducts },
    { label: 'Customers', value: customerCount },
    { label: 'Saved items', value: savedTotal },
    { label: 'Demo orders', value: orders.length },
    { label: 'In stock', value: inStockProducts },
  ];

  return (
    <div className="admin-page-stack">
      <AdminPageHeader
        eyebrow="ShopOra Admin"
        title="Operations Dashboard"
        subtitle="Monitor catalog health, low stock items, and storefront activity from one place."
        actions={
          <>
            <Link to="/admin/products/new" className="btn btn-dark">
              Add Product
            </Link>
            <Link to="/admin/products" className="btn btn-ghost">
              Manage Products
            </Link>
            <Link to="/" className="btn btn-outline">
              View Storefront
            </Link>
          </>
        }
      />

      <div className="empty-state admin-notice">
        <h2>Admin prototype</h2>
        <p>
          This dashboard is a frontend-only operations prototype backed by localStorage. It is not
          secure or production-ready yet, but it gives the ShopOra team a clean place to manage
          the catalog before backend tools are connected.
        </p>
      </div>

      <CatalogStatusNote variant="admin" className="admin-dashboard-catalog-status" />

      <div className="admin-card-grid">
        {cards.map((card) => (
          <div key={card.label} className="admin-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-status-grid">
        <section className="admin-status-card">
          <span>Out of Stock</span>
          <strong>{outOfStockProducts}</strong>
          <p>Products need restock attention before customers can add them to cart.</p>
        </section>
        <section className="admin-status-card">
          <span>Low Stock Alert</span>
          <strong>{lowStockItems.length}</strong>
          <p>Products are under the visual low-stock threshold.</p>
        </section>
        <section className="admin-status-card">
          <span>Pending Orders</span>
          <strong>{pendingOrders}</strong>
          <p>Orders waiting on fulfillment or status updates.</p>
        </section>
        <section className="admin-status-card">
          <span>Demo Revenue</span>
          <strong>${demoRevenueTotal.toFixed(2)}</strong>
          <p>Frontend-only revenue total from completed demo checkouts.</p>
        </section>
        <section className="admin-status-card">
          <span>Customer Activity</span>
          <strong>{customerCount}</strong>
          <p>Mock customer accounts are stored locally for demo workflows.</p>
        </section>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <strong>Low stock and recent catalog highlights</strong>
        </div>
        <div className="admin-toolbar-actions">
          <span className="count-badge">{lowStockProducts} low stock items</span>
          <span className="count-badge">{orders.length} total orders</span>
        </div>
      </div>

      <div className="admin-card-grid">
        <section className="admin-card">
          <span>Out of stock now</span>
          {outOfStockItems.length ? (
            <div className="admin-record-list">
              {outOfStockItems.map((product) => (
                <div key={product.id} className="admin-record-card">
                  <div className="admin-record-row">
                    <div className="admin-record-meta">
                      <strong>{product.name}</strong>
                      <span>{product.brand}</span>
                    </div>
                    <span className="status-badge stock-out">Out of stock</span>
                  </div>
                  <p>
                    {product.department} / {product.category}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No products are currently out of stock.</p>
          )}
        </section>

        <section className="admin-card">
          <span>Needs attention</span>
          {lowStockItems.length ? (
            <div className="admin-record-list">
              {lowStockItems.map((product) => (
                <div key={product.id} className="admin-record-card">
                  <div className="admin-record-row">
                    <div className="admin-record-meta">
                      <strong>{product.name}</strong>
                      <span>{product.brand}</span>
                    </div>
                    <span className="status-badge stock-low">{product.stockCount} left</span>
                  </div>
                  <p>
                    {product.department} / {product.category}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>All current products are above the low-stock threshold.</p>
          )}
        </section>

        <section className="admin-card">
          <span>Recent catalog highlights</span>
          {catalogHighlights.length ? (
            <div className="admin-record-list">
              {catalogHighlights.map((product) => (
                <div key={product.id} className="admin-record-card">
                  <div className="admin-record-meta">
                    <strong>{product.name}</strong>
                    <p>
                      {product.isNew ? 'New arrival' : 'Sale highlight'} · {product.brand}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No highlighted items yet. Mark products as new or sale to feature them here.</p>
          )}
        </section>

        <section className="admin-card">
          <span>Prototype notice</span>
          <p>
            The admin console is intentionally frontend-only. Product changes persist locally until
            a backend service replaces the demo catalog store.
          </p>
          {latestOrder ? (
            <div className="admin-latest-order">
              <strong>Latest order</strong>
              <p>
                {latestOrder.orderNumber} · {latestOrder.customerName} · $
                {latestOrder.total.toFixed(2)}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
