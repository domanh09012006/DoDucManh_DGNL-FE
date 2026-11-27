const SKU_REGEX = /^[A-Z]{3}-\d{4}$/;

export function formatPrice(price) {
  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice)) {
    return '0 ₫';
  }
  return `${new Intl.NumberFormat('vi-VN').format(numericPrice)} ₫`;
}

export function validateProductForm(form) {
  const errors = {};

  const trimmedName = String(form.name ?? '').trim();
  if (!trimmedName) {
    errors.name = 'Vui lòng nhập tên sản phẩm';
  } else if (trimmedName.length < 3 || trimmedName.length > 100) {
    errors.name = 'Tên sản phẩm phải từ 3 đến 100 ký tự';
  }

  const rawSku = String(form.sku ?? '');
  if (!rawSku.trim()) {
    errors.sku = 'Vui lòng nhập mã SKU';
  } else if (!SKU_REGEX.test(rawSku)) {
    errors.sku = 'SKU phải có dạng ABC-1234 (3 chữ in hoa, dấu gạch ngang, 4 chữ số)';
  }

  if (!form.category) {
    errors.category = 'Vui lòng chọn danh mục';
  }

  const rawPrice = String(form.price ?? '').trim();
  const numericPrice = Number(rawPrice);
  if (rawPrice === '' || Number.isNaN(numericPrice) || numericPrice <= 0) {
    errors.price = 'Giá phải là số lớn hơn 0';
  }

  const rawStock = String(form.stock ?? '').trim();
  const numericStock = Number(rawStock);
  if (rawStock === '' || !Number.isInteger(numericStock) || numericStock < 0) {
    errors.stock = 'Tồn kho phải là số nguyên không âm';
  }

  if (!['active', 'inactive'].includes(form.status)) {
    errors.status = 'Trạng thái không hợp lệ';
  }

  return errors;
}
