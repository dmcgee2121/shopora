export default function QuantitySelector({ quantity, onDecrease, onIncrease, min = 1 }) {
  return (
    <div className="quantity-selector">
      <button type="button" onClick={onDecrease} disabled={quantity <= min}>
        &minus;
      </button>
      <span>{quantity}</span>
      <button type="button" onClick={onIncrease}>
        +
      </button>
    </div>
  );
}
