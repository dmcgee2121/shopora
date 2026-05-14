export default function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
  min = 1,
  decreaseLabel = 'Decrease quantity',
  increaseLabel = 'Increase quantity',
}) {
  return (
    <div className="quantity-selector">
      <button type="button" onClick={onDecrease} disabled={quantity <= min} aria-label={decreaseLabel}>
        &minus;
      </button>
      <span>{quantity}</span>
      <button type="button" onClick={onIncrease} aria-label={increaseLabel}>
        +
      </button>
    </div>
  );
}
