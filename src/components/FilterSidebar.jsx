const statusOptions = [
  { value: '', label: 'All' },
  { value: 'sale', label: 'Sale' },
  { value: 'new', label: 'New' },
  { value: 'inStock', label: 'In stock' },
  { value: 'lowStock', label: 'Low stock' },
  { value: 'outOfStock', label: 'Out of stock' },
];

function filterGroupTitle(items = [], fallback) {
  return items.length > 1 ? fallback : null;
}

export default function FilterSidebar({
  availableCategories = [],
  availableDepartments = [],
  availableBrands = [],
  availableSizes = [],
  category,
  department,
  brand,
  size,
  price,
  saleOnly,
  status,
  onChange,
}) {
  return (
    <aside className="filter-sidebar">
      <div className="filter-heading">
        <h2>Refine the edit</h2>
        <p>Narrow the collection by category, brand, price, size, or product status.</p>
      </div>

      {filterGroupTitle(availableDepartments, 'Department') ? (
        <div className="filter-block">
          <h3>Department</h3>
          <div className="pill-group">
            <button
              type="button"
              className={!department ? 'pill active' : 'pill'}
              aria-pressed={!department}
              onClick={() => onChange({ department: '' })}
            >
              All
            </button>
            {availableDepartments.map((item) => (
              <button
                key={item}
                type="button"
                className={department === item ? 'pill active' : 'pill'}
                aria-pressed={department === item}
                onClick={() => onChange({ department: item })}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="filter-block">
        <h3>Category</h3>
        <div className="pill-group">
          <button
            type="button"
            className={!category ? 'pill active' : 'pill'}
            aria-pressed={!category}
            onClick={() => onChange({ category: '' })}
          >
            All
          </button>
          {availableCategories.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? 'pill active' : 'pill'}
              aria-pressed={category === item}
              onClick={() => onChange({ category: item })}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {availableBrands.length ? (
        <div className="filter-block">
          <h3>Brand</h3>
          <div className="pill-group">
            <button
              type="button"
              className={!brand ? 'pill active' : 'pill'}
              aria-pressed={!brand}
              onClick={() => onChange({ brand: '' })}
            >
              All
            </button>
            {availableBrands.map((item) => (
              <button
                key={item}
                type="button"
                className={brand === item ? 'pill active' : 'pill'}
                aria-pressed={brand === item}
                onClick={() => onChange({ brand: item })}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="filter-block">
        <h3>Price</h3>
        <div className="select-wrap">
          <select value={price} onChange={(event) => onChange({ price: event.target.value })}>
            <option value="">All prices</option>
            <option value="under50">Under $50</option>
            <option value="50to100">$50 to $100</option>
            <option value="over100">Over $100</option>
          </select>
        </div>
      </div>

      {availableSizes.length ? (
        <div className="filter-block">
          <h3>Size</h3>
          <div className="pill-group">
            <button type="button" className={!size ? 'pill active' : 'pill'} onClick={() => onChange({ size: '' })}>
              All
            </button>
            {availableSizes.map((item) => (
              <button
                key={item}
                type="button"
                className={size === item ? 'pill active' : 'pill'}
                aria-pressed={size === item}
                onClick={() => onChange({ size: item })}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="filter-block">
        <h3>Status</h3>
        <div className="pill-group">
          {statusOptions.map((item) => (
            <button
              key={item.value || 'all'}
              type="button"
              className={status === item.value ? 'pill active' : 'pill'}
              aria-pressed={status === item.value}
              onClick={() => onChange({ status: item.value })}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <label className="sale-toggle">
        <input
          type="checkbox"
          checked={saleOnly}
          onChange={(event) => onChange({ saleOnly: event.target.checked })}
        />
        Sale styles only
      </label>
    </aside>
  );
}
