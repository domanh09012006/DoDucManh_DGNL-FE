import ProductRow from './ProductRow.jsx';

export default function ProductTable({ products = [], onEdit, onDelete }) {
  return (
    <table className="product-table" data-testid="product-table">
      <thead>
        <tr>
          <th scope="col">Tên</th>
          <th scope="col">SKU</th>
          <th scope="col">Danh mục</th>
          <th scope="col">Giá</th>
          <th scope="col">Tồn kho</th>
          <th scope="col">Trạng thái</th>
          <th scope="col">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
}
