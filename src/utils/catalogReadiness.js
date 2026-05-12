function safeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function formatTitle(value) {
  if (!value) return '';

  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function safeNumber(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function hasDetails(product) {
  if (Array.isArray(product?.details)) {
    return product.details.some((item) => safeText(item));
  }

  if (typeof product?.details === 'string') {
    return safeText(product.details).length > 0;
  }

  return false;
}

export function getProductVisibilityInfo(product = {}) {
  const explicitStatus = safeText(product.status) || safeText(product.visibility);
  const normalizedStatus = explicitStatus.toLowerCase();

  if (normalizedStatus === 'archived' || product.archived || product.isArchived) {
    return {
      label: 'Archived',
      state: 'archived',
      className: 'status-archived',
      helper: 'Hidden from storefront browsing.',
    };
  }

  if (
    normalizedStatus === 'draft' ||
    normalizedStatus === 'hidden' ||
    normalizedStatus === 'inactive' ||
    normalizedStatus === 'unlisted' ||
    product.draft ||
    product.isDraft ||
    product.isActive === false
  ) {
    return {
      label: 'Draft',
      state: 'inactive',
      className: 'status-draft',
      helper: 'Saved in admin, hidden from shoppers.',
    };
  }

  if (normalizedStatus) {
    return {
      label: formatTitle(explicitStatus),
      state: 'active',
      className: 'status-active',
      helper: 'Custom catalog status from stored product data.',
    };
  }

  return {
    label: 'Active',
    state: 'active',
    className: 'status-active',
    helper: 'Visible in the storefront.',
  };
}

export function getProductReadinessIssues(product = {}) {
  const visibility = getProductVisibilityInfo(product);
  const issues = [];
  const stockCount = safeNumber(product.stockCount);
  if (visibility.state === 'archived') {
    issues.push({
      key: 'archived',
      label: 'Archived',
      tone: 'status-archived',
      severity: 100,
      detail: 'Hidden from storefront browsing.',
    });
  } else if (visibility.state === 'inactive') {
    issues.push({
      key: 'inactive',
      label: 'Draft / inactive',
      tone: 'status-draft',
      severity: 96,
      detail: 'Saved in admin, hidden from shoppers.',
    });
  }

  if (!safeText(product.image)) {
    issues.push({
      key: 'image',
      label: 'Missing image',
      tone: 'admin-issue-missing',
      severity: 92,
      detail: 'Add a primary product image for screenshots and product cards.',
    });
  }

  if (!safeText(product.brand)) {
    issues.push({
      key: 'brand',
      label: 'Missing brand',
      tone: 'admin-issue-missing',
      severity: 88,
      detail: 'Brand copy is blank or unavailable.',
    });
  }

  if (!safeText(product.sku)) {
    issues.push({
      key: 'sku',
      label: 'Missing SKU',
      tone: 'admin-issue-missing',
      severity: 84,
      detail: 'Add an internal SKU for catalog tracking.',
    });
  }

  if (safeNumber(product.price) === null || safeNumber(product.price) <= 0) {
    issues.push({
      key: 'price',
      label: 'Missing price',
      tone: 'admin-issue-missing',
      severity: 90,
      detail: 'Catalog prices need a valid base price.',
    });
  }

  if (stockCount === null) {
    issues.push({
      key: 'stockCount',
      label: 'Missing stock count',
      tone: 'admin-issue-missing',
      severity: 86,
      detail: 'Inventory count is not set yet.',
    });
  } else if (stockCount <= 0) {
    issues.push({
      key: 'outOfStock',
      label: 'Out of stock',
      tone: 'stock-out',
      severity: 52,
      detail: 'Shoppers cannot purchase this item right now.',
    });
  } else if (stockCount <= 7) {
    issues.push({
      key: 'lowStock',
      label: `Low stock (${stockCount})`,
      tone: 'stock-low',
      severity: 44,
      detail: 'Inventory is getting close to the low-stock threshold.',
    });
  }

  if (!safeText(product.description)) {
    issues.push({
      key: 'description',
      label: 'Missing description',
      tone: 'admin-issue-missing',
      severity: 72,
      detail: 'Add shopper-facing product copy.',
    });
  }

  if (!hasDetails(product)) {
    issues.push({
      key: 'details',
      label: 'Missing details',
      tone: 'admin-issue-missing',
      severity: 70,
      detail: 'Add bullets or a short details list.',
    });
  }

  return issues.sort((left, right) => right.severity - left.severity);
}

export function getCatalogReadinessSummary(products = []) {
  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];

  return safeProducts.reduce(
    (summary, product) => {
      const visibility = getProductVisibilityInfo(product);
      const stockCount = safeNumber(product.stockCount);
      const issues = getProductReadinessIssues(product);

      summary.totalProducts += 1;
      summary.activeProducts += visibility.state === 'active' ? 1 : 0;
      summary.inactiveProducts += visibility.state === 'inactive' ? 1 : 0;
      summary.archivedProducts += visibility.state === 'archived' ? 1 : 0;

      if (stockCount !== null) {
        if (stockCount <= 0) {
          summary.outOfStockProducts += 1;
        } else if (stockCount <= 7) {
          summary.lowStockProducts += 1;
        }
      }

      if (product.isSale || safeNumber(product.salePrice) > 0) {
        summary.saleProducts += 1;
      }

      if (product.isNew || product.featured) {
        summary.featuredProducts += 1;
      }

      if (issues.some((issue) => issue.key === 'image' || issue.key === 'brand' || issue.key === 'sku' || issue.key === 'price' || issue.key === 'stockCount' || issue.key === 'description' || issue.key === 'details')) {
        summary.missingMerchandisingInfo += 1;
      }

      if (issues.length) {
        summary.productsNeedingAttention += 1;
      }

      return summary;
    },
    {
      totalProducts: 0,
      activeProducts: 0,
      inactiveProducts: 0,
      archivedProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      saleProducts: 0,
      featuredProducts: 0,
      missingMerchandisingInfo: 0,
      productsNeedingAttention: 0,
    },
  );
}

export function getCatalogAttentionProducts(products = [], { limit = 5 } = {}) {
  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];

  return safeProducts
    .map((product) => {
      const issues = getProductReadinessIssues(product);

      return {
        product,
        issues,
        issueCount: issues.length,
        priority: issues[0]?.severity ?? 0,
      };
    })
    .filter((entry) => entry.issueCount > 0)
    .sort((left, right) => {
      if (right.priority !== left.priority) return right.priority - left.priority;
      if (right.issueCount !== left.issueCount) return right.issueCount - left.issueCount;

      const leftName = safeText(left.product.name).toLowerCase();
      const rightName = safeText(right.product.name).toLowerCase();
      return leftName.localeCompare(rightName);
    })
    .slice(0, limit);
}
