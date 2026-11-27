import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function useProductSearch({
  q = '',
  category = '',
  status = '',
  page = 1,
  limit = 10,
  reloadTrigger = 0,
}) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [internalReload, setInternalReload] = useState(0);

  const trimmedQ = String(q ?? '').trim();

  function reload() {
    setInternalReload((prev) => prev + 1);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get('/products', {
          params: {
            q: trimmedQ,
            category,
            status,
            page,
            limit,
          },
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setProducts(Array.isArray(res.data?.data) ? res.data.data : []);
        setTotal(typeof res.data?.total === 'number' ? res.data.total : 0);
        setLoading(false);
      } catch (err) {
        if (
          controller.signal.aborted ||
          err.name === 'CanceledError' ||
          err.code === 'ERR_CANCELED'
        ) {
          return;
        }

        const message =
          err.response?.data?.message ||
          'Không thể tải danh sách sản phẩm. Vui lòng thử lại.';
        setError(message);
        setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [trimmedQ, category, status, page, limit, reloadTrigger, internalReload]);

  return { products, total, loading, error, reload };
}
