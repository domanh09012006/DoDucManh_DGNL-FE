import { formatPrice } from '../utils/productUtils.js';

export default function ProductRow({ product, categoryMap = {}, onEdit, onDelete }) {
  const categoryLabel = categoryMap[product.category] || product.category;
  const isOutOfStock = product.stock === 0;
  const isActive = product.status === 'active';

  function handleEditClick() {
    if (onEdit) {
      onEdit(product);
    }
  }

  function handleDeleteClick() {
    if (onDelete) {
      onDelete(product);
    }
  }

  return (
    <tr className="product-row" data-testid="product-row">
      <td className="cell-name" data-label="Tên">
        {product.name}
      </td>
      <td className="cell-sku" data-label="SKU">
        {product.sku}
      </td>
      <td className="cell-category" data-label="Danh mục">
        {categoryLabel}
      </td>
      <td className="cell-price" data-label="Giá">
        {formatPrice(product.price)}
      </td>
      <td className="cell-stock" data-label="Tồn kho">
        {isOutOfStock ? (
          <span className="stock-out">Hết hàng</span>
        ) : (
          <span className="stock-available">{product.stock}</span>
        )}
      </td>
      <td className="cell-status" data-label="Trạng thái">
        <span
          className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}
          data-testid="product-status"
        >
          {isActive ? 'Đang bán' : 'Ngừng bán'}
        </span>
      </td>
      <td className="cell-actions" data-label="Thao tác">
        <div className="action-buttons">
          <button
            type="button"
            className="btn-action btn-edit"
            data-testid="edit-button"
            onClick={handleEditClick}
          >
            Sửa
          </button>
          <button
            type="button"
            className="btn-action btn-delete"
            data-testid="delete-button"
            onClick={handleDeleteClick}
          >
            Xoá
          </button>
        </div>
      </td>
    </tr>
  );
}
