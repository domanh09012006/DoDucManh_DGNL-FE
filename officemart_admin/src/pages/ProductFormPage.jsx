import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosClient.js';
import { useToast } from '../context/ToastContext.jsx';
import { validateProductForm } from '../utils/productUtils.js';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
    status: 'active',
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFormData() {
      setLoading(true);
      setLoadError(null);
      setErrors({});
      setSubmitError(null);

      try {
        if (isEditMode) {
          const [categoriesRes, productRes] = await Promise.all([
            api.get('/categories'),
            api.get(`/products/${id}`),
          ]);

          if (cancelled) {
            return;
          }

          setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
          const product = productRes.data;
          setForm({
            name: product.name ?? '',
            sku: product.sku ?? '',
            category: product.category ?? '',
            price:
              product.price !== undefined && product.price !== null
                ? String(product.price)
                : '',
            stock:
              product.stock !== undefined && product.stock !== null
                ? String(product.stock)
                : '',
            status: product.status || 'active',
          });
        } else {
          const categoriesRes = await api.get('/categories');

          if (cancelled) {
            return;
          }

          setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
          setForm({
            name: '',
            sku: '',
            category: '',
            price: '',
            stock: '',
            status: 'active',
          });
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (err.response?.status === 404) {
          setLoadError('Không tìm thấy sản phẩm');
        } else {
          const message =
            err.response?.data?.message || 'Không thể tải dữ liệu sản phẩm. Vui lòng thử lại.';
          setLoadError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFormData();

    return () => {
      cancelled = true;
    };
  }, [id, isEditMode]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function handleCancel() {
    navigate('/products');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validateProductForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      sku: form.sku,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      status: form.status,
    };

    try {
      if (isEditMode) {
        await api.put(`/products/${id}`, payload);
        showToast('Đã cập nhật sản phẩm');
      } else {
        await api.post('/products', payload);
        showToast('Đã thêm sản phẩm');
      }
      navigate('/products');
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 409) {
        setErrors((prev) => ({
          ...prev,
          sku: data?.message || 'SKU đã tồn tại',
        }));
      } else if (status === 400 && data?.field) {
        setErrors((prev) => ({
          ...prev,
          [data.field]: data.message || 'Dữ liệu không hợp lệ',
        }));
      } else {
        setSubmitError(data?.message || 'Không thể lưu sản phẩm. Vui lòng thử lại.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="form-page">
      <div className="page-header">
        <h1 className="page-title">
          {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
        </h1>
      </div>

      {loading && (
        <div className="state-box" data-testid="loading">
          Đang tải dữ liệu...
        </div>
      )}

      {!loading && loadError && (
        <div className="state-box state-error" data-testid="error-message" role="alert">
          <p className="state-text">{loadError}</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancel}
          >
            Quay lại danh sách
          </button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="form-card">
          {submitError && (
            <div className="error-banner" data-testid="error-message" role="alert">
              {submitError}
            </div>
          )}

          <form
            className="product-form"
            data-testid="product-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Tên sản phẩm
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                value={form.name}
                onChange={handleChange}
                placeholder="Ví dụ: Bàn phím cơ K87"
              />
              {errors.name && (
                <p className="field-error" data-testid="field-error-name">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="sku" className="form-label">
                SKU
              </label>
              <input
                id="sku"
                name="sku"
                type="text"
                className={`form-input ${errors.sku ? 'input-error' : ''}`}
                value={form.sku}
                onChange={handleChange}
                placeholder="Ví dụ: KEY-0001"
              />
              {errors.sku && (
                <p className="field-error" data-testid="field-error-sku">
                  {errors.sku}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Danh mục
              </label>
              <select
                id="category"
                name="category"
                className={`form-input ${errors.category ? 'input-error' : ''}`}
                value={form.category}
                onChange={handleChange}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="field-error" data-testid="field-error-category">
                  {errors.category}
                </p>
              )}
            </div>

            <div className="form-row-two">
              <div className="form-group">
                <label htmlFor="price" className="form-label">
                  Giá (₫)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  className={`form-input ${errors.price ? 'input-error' : ''}`}
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Ví dụ: 1290000"
                />
                {errors.price && (
                  <p className="field-error" data-testid="field-error-price">
                    {errors.price}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="stock" className="form-label">
                  Tồn kho
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  className={`form-input ${errors.stock ? 'input-error' : ''}`}
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Ví dụ: 10"
                />
                {errors.stock && (
                  <p className="field-error" data-testid="field-error-stock">
                    {errors.stock}
                  </p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                className={`form-input ${errors.status ? 'input-error' : ''}`}
                value={form.status}
                onChange={handleChange}
              >
                <option value="active">Đang bán</option>
                <option value="inactive">Ngừng bán</option>
              </select>
              {errors.status && (
                <p className="field-error" data-testid="field-error-status">
                  {errors.status}
                </p>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Huỷ
              </button>
              <button
                type="submit"
                className="btn-primary"
                data-testid="submit-button"
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
