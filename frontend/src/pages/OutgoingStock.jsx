import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate, Link } from 'react-router-dom';

const OutgoingStock = () => {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products`);
        setProducts(response.data);
        if (response.data.length > 0) {
          setProductId(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await axios.post(`${API_BASE_URL}/outgoing`, {
        product_id: parseInt(productId),
        quantity: parseInt(quantity),
      });
      navigate('/');
    } catch (error) {
      console.error('Error recording outgoing stock:', error);
      if (error.response && error.response.status === 400) {
        setErrorMsg('Insufficient stock for this product!');
      } else {
        setErrorMsg('An error occurred while recording outgoing stock.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center mt-10">Loading products...</div>;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-slate-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h2 className="text-2xl font-semibold text-slate-100">Record Outgoing Stock</h2>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-800 p-8">
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center text-slate-400">
            <p className="mb-4">No products available. You must add a product first.</p>
            <Link to="/add-product" className="text-indigo-400 hover:text-indigo-300 underline">Add Product</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Product</label>
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current: {p.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Quantity Dispatching</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-600"
                placeholder="0"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-rose-500/20 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Recording...' : 'Record Outgoing Stock'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OutgoingStock;
