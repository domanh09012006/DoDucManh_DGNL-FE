import sampleProducts from '../data/sample.js';
import ProductTable from '../components/ProductTable.jsx';

export default function ProductListPage() {
  const sortedProducts = [...sampleProducts].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
  );

  return (
    <section className="product-page">
      <div className="page-header">
        <h1 className="page-title">Sản phẩm</h1>
        <button
          type="button"
          className="btn-primary"
          data-testid="add-button"
        >
          Thêm sản phẩm
        </button>
      </div>
      <div className="table-card">
        <ProductTable products={sortedProducts} />
      </div>
    </section>
  );
}
