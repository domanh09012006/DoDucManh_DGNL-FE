export function formatPrice(price) {
  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice)) {
    return '0 ₫';
  }
  return `${new Intl.NumberFormat('vi-VN').format(numericPrice)} ₫`;
}
