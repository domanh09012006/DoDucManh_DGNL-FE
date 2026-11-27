import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosClient.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ProductTable from '../components/ProductTable.jsx';
import { useToast } from '../context/ToastContext.jsx';
import useProductSearch from '../hooks/useProductSearch.js';

const PAGE_LIMIT = 10;

function parsePositivePage(rawPage) {
  if (!rawPage) {
    return 1;
  }
  const trimmed = String(rawPage).trim();
  if (!/^\d+$/.test(trimmed)) {
    return 1;
  }
  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
}

function buildSearchParams({ q, category, status, page }) {
  const params = new URLSearchParams();
  if (q && q.trim() !== '') {
    params.set('q', q);
  }
  if (category) {
    params.set('category', category);
  }
  if (status) {
    params.set('status', status);
  }
  if (page > 1) {
    params.set('page', String(page));
  }
  return params;
}

export default function ProductListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const urlQ = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlStatus = searchParams.get('status') || '';
  const urlPage = parsePositivePage(searchParams.get('page'));

  const [searchText, setSearchText] = useState(urlQ);
  const [categories, setCategories] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const { products, total, loading, error, reload } = useProductSearch({
    q: urlQ,
    category: urlCategory,
    status: urlStatus,
    page: urlPage,
    limit: PAGE_LIMIT,
    reloadTrigger,
  });

  useEffect(() => {
    setSearchText(urlQ);
  }, [urlQ]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const res = await api.get('/categories', {
          signal: controller.signal,
        });
        if (!controller.signal.aborted && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        if (
          controller.signal.aborted ||
          err.name === 'CanceledError' ||
          err.code === 'ERR_CANCELED'
        ) {
          return;
        }
      }
    }

    fetchCategories();

    return () => {
      controller.abort();
    };
  }, [reloadTrigger]);

  useEffect(() => {
    const normalizedSearch = searchText.trim() === '' ? '' : searchText;
    const normalizedUrlQ = urlQ.trim() === '' ? '' : urlQ;

    if (normalizedSearch === normalizedUrlQ) {
      return undefined;
    }

    const timerId = setTimeout(() => {
      const nextParams = buildSearchParams({
        q: normalizedSearch,
        category: urlCategory,
        status: urlStatus,
        page: 1,
      });
      setSearchParams(nextParams);
    }, 400);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchText, urlQ, urlCategory, urlStatus, setSearchParams]);

  const categoryMap = {};
  categories.forEach((cat) => {
    categoryMap[cat.id] = cat.name;
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  function handleCategoryChange(event) {
    const nextCategory = event.target.value;
    const nextParams = buildSearchParams({
      q: searchText.trim() === '' ? '' : searchText,
      category: nextCategory,
      status: urlStatus,
      page: 1,
    });
    setSearchParams(nextParams);
  }

  function handleStatusChange(event) {
    const nextStatus = event.target.value;
    const nextParams = buildSearchParams({
      q: searchText.trim() === '' ? '' : searchText,
      category: urlCategory,
      status: nextStatus,
      page: 1,
    });
    setSearchParams(nextParams);
  }

  function handlePageChange(nextPage) {
    const safePage = Math.max(1, Math.min(totalPages, nextPage));
    const nextParams = buildSearchParams({
      q: urlQ,
      category: urlCategory,
      status: urlStatus,
      page: safePage,
    });
    setSearchParams(nextParams);
  }

  function handleRetry() {
    setReloadTrigger((prev) => prev + 1);
    reload();
  }

  function handleAddClick() {
    navigate('/products/new');
  }

  function handleEditClick(product) {
    navigate(`/products/${product.id}/edit`);
  }

  function handleDeleteClick(product) {
    setDeleteError(null);
    setProductToDelete(product);
  }

  function handleCancelDelete() {
    if (deleting) {
      return;
    }
    setProductToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!productToDelete) {
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/products/${productToDelete.id}`);
      const wasLastItemOnPage = products.length === 1 && urlPage > 1;
      setProductToDelete(null);
      showToast('Đã xoá sản phẩm');
      if (wasLastItemOnPage) {
        handlePageChange(urlPage - 1);
      } else {
        reload();
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Không thể xoá sản phẩm. Vui lòng thử lại.';
      setDeleteError(message);
      setProductToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="product-page">
      <div className="page-header">
        <h1 className="page-title">Sản phẩm</h1>
        <button
          type="button"
          className="btn-primary"
          data-testid="add-button"
          onClick={handleAddClick}
        >
          Thêm sản phẩm
        </button>
      </div>

      <div className="toolbar">
        <input
          type="text"
          aria-label="Tìm kiếm sản phẩm"
          className="search-input"
          data-testid="search-input"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Tìm theo tên hoặc SKU..."
        />

        <select
          aria-label="Lọc theo danh mục"
          className="filter-select"
          data-testid="category-filter"
          value={urlCategory}
          onChange={handleCategoryChange}
        >
          <option value="">Tất cả</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Lọc theo trạng thái"
          className="filter-select"
          data-testid="status-filter"
          value={urlStatus}
          onChange={handleStatusChange}
        >
          <option value="">Tất cả</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Ngừng bán</option>
        </select>
      </div>

      {deleteError && (
        <div className="error-banner" role="alert">
          <span>{deleteError}</span>
        </div>
      )}

      {loading && (
        <div className="state-box" data-testid="loading">
          Đang tải danh sách sản phẩm...
        </div>
      )}

      {!loading && error && (
        <div className="state-box state-error" data-testid="error-message" role="alert">
          <p className="state-text">{error}</p>
          <button
            type="button"
            className="btn-secondary"
            data-testid="retry-button"
            onClick={handleRetry}
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="state-box" data-testid="empty-state">
          Không tìm thấy sản phẩm phù hợp.
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="table-card">
          <ProductTable
            products={products}
            categoryMap={categoryMap}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </div>
      )}

      {!loading && !error && (
        <div className="pagination" data-testid="pagination">
          <button
            type="button"
            className="btn-secondary"
            data-testid="page-prev"
            disabled={urlPage <= 1}
            onClick={() => handlePageChange(urlPage - 1)}
          >
            Trang trước
          </button>
          <span className="page-current" data-testid="page-current">
            {`${urlPage}/${totalPages}`}
          </span>
          <button
            type="button"
            className="btn-secondary"
            data-testid="page-next"
            disabled={urlPage >= totalPages}
            onClick={() => handlePageChange(urlPage + 1)}
          >
            Trang sau
          </button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(productToDelete)}
        title="Xác nhận xoá sản phẩm"
        message={
          productToDelete
            ? `Bạn có chắc chắn muốn xoá sản phẩm "${productToDelete.name}"?`
            : ''
        }
        confirmLabel="Xoá"
        cancelLabel="Huỷ"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </section>
  );
}
