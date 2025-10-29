import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, CheckCircle, Check, Menu, X } from 'lucide-react';
import { useCart } from '../../../../context-api/productcartSlice';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { addItem, itemCount } = useCart();
  const cartRef = useRef(null);
  const addToCartRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get('https://mocki.io/v1/4995341a-1b6f-4ba5-8d7f-646d8b0ca4eb');
        const found = res.data.find((p) => String(p.id) === id);
        setProduct(found);
      } catch (err) {
        console.error('Failed to fetch product', err);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addItem(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const animateFlyToCart = (sourceEl) => {
    if (!sourceEl || !cartRef.current) return;
    const src = sourceEl.getBoundingClientRect();
    const dst = cartRef.current.getBoundingClientRect();
    const clone = sourceEl.cloneNode(true);
    Object.assign(clone.style, {
      position: 'fixed',
      top: `${src.top}px`,
      left: `${src.left}px`,
      width: `${src.width}px`,
      height: `${src.height}px`,
      pointerEvents: 'none',
      zIndex: 9999,
      opacity: 1,
      borderRadius: '8px',
      transition: 'transform 1s, opacity 1s',
      background: '#fff',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    });
    document.body.appendChild(clone);
    const deltaX = dst.left + dst.width / 2 - (src.left + src.width / 2);
    const deltaY = dst.top + dst.height / 2 - (src.top + src.height / 2);
    clone.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${deltaX / 2}px, ${deltaY / 2 - 150}px) scale(0.6) rotate(180deg)`, opacity: 0.8 },
      { transform: `translate(${deltaX}px, ${deltaY}px) scale(0.2) rotate(360deg)`, opacity: 0 }
    ], {
      duration: 1000,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards'
    }).onfinish = () => {
      clone.remove();
      cartRef.current.classList.add('cart-bounce');
      setTimeout(() => cartRef.current.classList.remove('cart-bounce'), 400);
    };
  };

  if (!product) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-center text-gray-600">Loading product...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button onClick={() => setIsMenuOpen(false)}><X className="h-6 w-6" /></button>
          </div>
          <div className="p-4 space-y-4">
            <Link to="/patientdashboard/orders" className="block py-2 text-gray-700 hover:text-[var(--primary-color)] font-medium" onClick={() => setIsMenuOpen(false)}>Orders</Link>
            <Link to="/patientdashboard/cartproduct" className="block py-2 text-gray-700 hover:text-[var(--primary-color)] font-medium" onClick={() => setIsMenuOpen(false)}>Cart</Link>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-40 bg-gray-50/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-1.5 text-gray-700"><Menu className="h-5 w-5" /></button>
            <div className="flex-1 flex items-center">
              <Link to="/patientdashboard/shopping" className="text-[var(--primary-color)] hover:underline text-sm font-medium flex items-center gap-1"><span className="md:hidden">←</span><span className="hidden md:inline">← Back to Products</span></Link>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/patientdashboard/orders" className="text-sm font-medium text-gray-700 hover:text-[var(--primary-color)]">Orders</Link>
              <Link to="/patientdashboard/cartproduct" ref={cartRef} className="relative p-1.5 text-gray-700 hover:text-[var(--primary-color)]">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{itemCount}</span>}
              </Link>
            </nav>
          </div>
        </div>
      </header>
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-down text-sm">
          <CheckCircle className="w-4 h-4" /><span>Added to cart</span>
        </div>
      )}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm">
          <div className="flex flex-col gap-4">
            <img src={product.image} alt={product.name} className="rounded-xl w-full max-h-[300px] sm:max-h-[400px] object-contain border border-gray-100" />
            {!product.inStock && <span className="text-red-600 text-center font-semibold text-sm">Out of Stock</span>}
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{product.name}</h1>
              <p className="text-xs sm:text-sm text-gray-500">{product.category} • {product.brand}</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="font-semibold text-lg sm:text-xl text-[var(--primary-color)]">₹{product.price.toFixed(2)}</span>
              {product.originalPrice && <span className="text-xs sm:text-sm text-gray-500 line-through">₹{product.originalPrice.toFixed(2)}</span>}
            </div>
            <div className="prose prose-sm sm:prose-base max-w-none">
              <p className="text-gray-600 text-sm sm:text-base">{product.description || 'No description available.'}</p>
            </div>
            {product.features && (
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm sm:text-base"><Check className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" /><span>{feature}</span></li>
                ))}
              </ul>
            )}
            {product.inStock && product.stockQuantity <= 10 && <p className="text-orange-600 text-sm font-medium">Hurry! Only {product.stockQuantity} left in stock.</p>}
            <button ref={addToCartRef} onClick={() => { handleAddToCart(); animateFlyToCart(addToCartRef.current); }} disabled={!product.inStock} className={`w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2 ${product.inStock ? 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-dark)]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />{product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </main>
      <style jsx>{`
        .cart-bounce { animation: cart-bounce-glow 0.4s ease; }
        @keyframes cart-bounce-glow { 0%, 100% { transform: scale(1); box-shadow: none; } 50% { transform: scale(1.2); box-shadow: 0 0 10px 3px rgba(255, 165, 0, 0.7); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-down { animation: fadeInDown 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ProductDetail;
