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

function hasMerchandisingDetails(product) {
  return Boolean(
    safeText(product?.material) ||
      safeText(product?.care) ||
      safeText(product?.fit) ||
      hasDetails(product),
  );
}

function countGalleryImages(product) {
  if (!Array.isArray(product?.images)) {
    return 0;
  }

  return product.images.filter((image) => safeText(image)).length;
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

export function getProductEditorReadinessChecklist(product = {}) {
  const visibility = getProductVisibilityInfo(product);
  const name = safeText(product.name);
  const brand = safeText(product.brand);
  const sku = safeText(product.sku);
  const department = safeText(product.department);
  const category = safeText(product.category);
  const description = safeText(product.description);
  const image = safeText(product.image);
  const material = safeText(product.material);
  const care = safeText(product.care);
  const fit = safeText(product.fit);
  const galleryCount = countGalleryImages(product);
  const price = safeNumber(product.price);
  const salePrice = safeNumber(product.salePrice);
  const stockCount = safeNumber(product.stockCount);
  const saleConfigured = Boolean(product.isSale || salePrice !== null);
  const hasDetailsBlock = hasDetails(product);
  const hasMerchandisingCopy = hasMerchandisingDetails(product);

  return [
    {
      key: 'visibility',
      label: 'Visibility',
      ready: visibility.state === 'active',
      note:
        visibility.state === 'active'
          ? visibility.helper
          : `${visibility.label} products stay hidden from shoppers until they are activated.`,
    },
    {
      key: 'name',
      label: 'Product name',
      ready: Boolean(name),
      note: Boolean(name) ? 'Set and visible in the editor preview.' : 'Add the shopper-facing product title.',
    },
    {
      key: 'brand',
      label: 'Brand',
      ready: Boolean(brand),
      note: Boolean(brand) ? 'Brand copy is present.' : 'Add the published brand name.',
    },
    {
      key: 'sku',
      label: 'SKU',
      ready: Boolean(sku),
      note: Boolean(sku) ? 'SKU available for catalog tracking.' : 'Add or generate an internal SKU.',
    },
    {
      key: 'taxonomy',
      label: 'Category / department',
      ready: Boolean(category && department),
      note:
        category && department
          ? `${department} / ${category}`
          : 'Assign both department and category so filters work cleanly.',
    },
    {
      key: 'pricing',
      label: 'Base price',
      ready: price !== null && price > 0,
      note:
        price !== null && price > 0
          ? `Base price set to $${price.toFixed(2)}.`
          : 'Enter a base price greater than zero.',
    },
    {
      key: 'sale',
      label: 'Sale price',
      ready: !saleConfigured || (salePrice !== null && price !== null && salePrice > 0 && salePrice < price),
      note:
        !saleConfigured
          ? 'No sale price set.'
          : salePrice !== null && price !== null && salePrice > 0 && salePrice < price
            ? `Sale price set to $${salePrice.toFixed(2)}.`
            : 'Sale price must stay below the base price.',
    },
    {
      key: 'stock',
      label: 'Stock count',
      ready: stockCount !== null && stockCount > 0,
      note:
        stockCount === null
          ? 'Add a stock count.'
          : stockCount <= 0
            ? 'Out of stock right now.'
            : stockCount <= 7
              ? `Low stock at ${stockCount} units.`
              : `${stockCount} units available.`,
    },
    {
      key: 'description',
      label: 'Description',
      ready: Boolean(description),
      note: Boolean(description) ? 'Shopper-facing description is set.' : 'Add a concise product description.',
    },
    {
      key: 'image',
      label: 'Primary image',
      ready: Boolean(image),
      note: Boolean(image) ? 'Hero image available for the storefront.' : 'Add a primary image URL.',
    },
    {
      key: 'gallery',
      label: 'Gallery images',
      ready: galleryCount > 0,
      note: galleryCount > 0 ? `${galleryCount} gallery image${galleryCount === 1 ? '' : 's'} added.` : 'Optional, but useful for demos.',
    },
    {
      key: 'merchandising',
      label: 'Merchandising details',
      ready: hasMerchandisingCopy,
      note:
        hasMerchandisingCopy
          ? [
              material ? 'Material' : null,
              care ? 'Care' : null,
              fit ? 'Fit' : null,
              hasDetailsBlock ? 'Details' : null,
            ]
              .filter(Boolean)
              .join(', ')
          : 'Add material, care, fit, or detail bullets.',
    },
  ];
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
