import { useState, useCallback } from 'react';
import api from '../../utils/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(params).toString();
      const { data } = await api.get(`/products?${query}`);
      setProducts(data.products);
      setPagination({ total: data.total, page: data.page, pages: data.pages });
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProduct = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      return data;
    } catch (err) {
      console.error('Fetch product error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (query) => {
    if (!query || query.length < 1) { setSearchResults([]); return; }
    try {
      const { data } = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    }
  }, []);

  const clearSearch = () => setSearchResults([]);

  return { products, product, loading, searchResults, pagination, fetchProducts, fetchProduct, searchProducts, clearSearch };
};