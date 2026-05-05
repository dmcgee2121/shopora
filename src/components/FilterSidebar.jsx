export default function FilterSidebar({
  availableCategories,
  availableSizes,
  category,
  size,
  price,
  saleOnly,
  onChange,
}) {
  return (
    <aside className="filter-sidebar">
      <div className="filter-heading">
        <h2>Refine</h2>
        <p>Narrow the collection by category, price, size, or sale styles.</p>
      </div>

      <div className="filter-block">
        <h3>Category</h3>
        <div className="pill-group">
          <button
            type="button"
            className={!category ? 'pill active' : 'pill'}
            onClick={() => onChange({ category: '' })}
          >
            All
          </button>
          {availableCategories.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? 'pill active' : 'pill'}
              onClick={() => onChange({ category: item })}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

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

      <div className="filter-block">
        <h3>Size</h3>
        <div className="pill-group">
          <button
            type="button"
            className={!size ? 'pill active' : 'pill'}
            onClick={() => onChange({ size: '' })}
          >
            All
          </button>
          {availableSizes.map((item) => (
            <button
              key={item}
              type="button"
              className={size === item ? 'pill active' : 'pill'}
              onClick={() => onChange({ size: item })}
            >
              {item}
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
