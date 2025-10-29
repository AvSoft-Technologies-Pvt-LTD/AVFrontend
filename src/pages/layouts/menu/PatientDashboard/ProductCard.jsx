import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Star,
  Heart,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  Search,
  Menu,
  X,
} from 'lucide-react';
import axios from 'axios';
import { useCart } from '../../../../context-api/productcartSlice';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemCount, setItemCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://mocki.io/v1/4995341a-1b6f-4ba5-8d7f-646d8b0ca4eb');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const all = products.map(p => p.category);
    return ['All Categories', ...new Set(all)];
  }, [products]);

  const updateCartCount = () => {
    setItemCount(prev => prev + 1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const animateFly = (sourceEl) => {
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
      boxShadow: '0 0 15px rgba(255, 165, 0, 0.7)',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
    document.body.appendChild(clone);
    const startX = src.left + src.width / 2;
    const startY = src.top + src.height / 2;
    const endX = dst.left + dst.width / 2;
    const endY = dst.top + dst.height / 2;
    clone.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        {
          transform: `translate(${(endX - startX) / 2}px, -150px) scale(0.6)`,
          opacity: 0.8,
        },
        {
          transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.2)`,
          opacity: 0,
        },
      ],
      {
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
      }
    ).onfinish = () => {
      clone.remove();
      cartRef.current.classList.add('cart-bounce');
      setTimeout(() => cartRef.current.classList.remove('cart-bounce'), 400);
    };
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchCategory =
        selectedCategory === 'All Categories' || product.category === selectedCategory;
      const matchPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchPrice && matchSearch;
    });
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return filtered;
  }, [products, selectedCategory, sortBy, priceRange, searchQuery]);

  const ProductCard = ({ product, updateCartCount, flyToCart }) => {
    const { addItem } = useCart();
    const btnRef = useRef(null);
    const handleAddToCart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      addItem(product);
      updateCartCount();
      if (btnRef.current && flyToCart) flyToCart(btnRef.current);
    };

    const renderStars = (rating) => {
      return Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-3 w-3 md:h-4 md:w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
      ));
    };

    return (
      <Link to={`/patientdashboard/product/${product.id}`} className="group block">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col">
          <div className="relative flex items-center justify-center h-32 md:h-40 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="object-contain h-full w-full transition-transform duration-300 group-hover:scale-105"
            />
            {product.originalPrice && (
              <div className="absolute top-1.5 left-1.5 bg-red-500 text-white px-1.5 py-0.5 rounded-md text-[10px] md:text-xs font-semibold">
                SAVE ₹{(product.originalPrice - product.price).toFixed(2)}
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-semibold text-sm md:text-lg">Out of Stock</span>
              </div>
            )}
          </div>
          <div className="p-2.5 md:p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-500 mb-1.5">
              <span className="font-medium">{product.brand}</span>
              <span className="text-[10px]">{product.category}</span>
            </div>
            <h3 className="font-semibold text-[13px] md:text-sm text-gray-900 mb-1.5 line-clamp-2">{product.name}</h3>
            <div className="flex items-center space-x-0.5 mb-2">
              <div className="flex">{renderStars(product.rating)}</div>
              <span className="text-[10px] md:text-xs text-gray-600">({product.reviews})</span>
            </div>
            <div className="flex items-center space-x-1.5 mb-3">
              <span className="font-semibold text-sm md:text-base">₹{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-[10px] md:text-sm text-gray-500 line-through">
                  ₹{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <button
              ref={btnRef}
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full py-1.5 md:py-2 px-1.5 md:px-4 rounded-lg text-[10px] md:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${product.inStock ? 'bg-[var(--primary-color)] text-white ' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
              {product.inStock ? ' Add ' : 'Out of Stock'}
            </button>
            {product.inStock && product.stockQuantity <= 10 && (
              <p className="text-[10px] text-orange-600 mt-1.5 text-center">Only {product.stockQuantity} left!</p>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay (optional) */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Half-page drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <Link
                to="/patientdashboard/orders"
                className="flex items-center space-x-2 py-2 text-gray-700 hover:text-[var(--primary-color)] font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Orders</span>
              </Link>
              <Link
                to="/patientdashboard/cartproduct"
                className="relative flex items-center space-x-2 py-2 text-gray-700 hover:text-[var(--primary-color)] font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
                {itemCount > 0 && (
                  <span className="absolute left-8 -top-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-gray-50/95 backdrop-blur-sm">
          <div className="flex items-center justify-between h-12 sm:h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-1.5 text-gray-700"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Search Bar - Hidden on Mobile */}
            <form onSubmit={handleSearch} className="hidden md:flex w-full max-w-xs lg:max-w-md mr-2 lg:mr-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)]"
                />
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
              </div>
            </form>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-3 lg:space-x-6">
              <Link
                to="/patientdashboard/orders"
                className="text-[10px] sm:text-sm font-medium text-gray-700 hover:text-[var(--primary-color)]"
              >
                Orders
              </Link>
              <Link
                to="/patientdashboard/cartproduct"
                ref={cartRef}
                className="relative p-1.5 text-gray-700 hover:text-[var(--primary-color)]"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] sm:text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </nav>
            {/* Mobile Search Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-1.5 text-gray-700"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </header>
        {/* Mobile Search Bar - Visible when toggled */}
        {showFilters && (
          <div className="md:hidden mt-2 mb-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)]"
                />
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
              </div>
            </form>
          </div>
        )}
        {/* Layout: Filters + Product Grid */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-2 sm:mt-4">
          {/* Filters Sidebar - Hidden on Mobile by default */}
          <div className={`md:w-56 lg:w-64 ${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm sm:text-base font-semibold flex items-center">
                  <Filter className="h-4 w-4 mr-1.5" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden p-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Category Filter */}
              <div className="mb-4">
                <h4 className="font-medium text-xs sm:text-sm text-gray-900 mb-2">Category</h4>
                <div className="space-y-1.5">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setShowFilters(false);
                        }}
                        className="h-3.5 w-3.5 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300"
                      />
                      <span className="ml-1.5 text-[10px] sm:text-xs text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Price Range Filter */}
              <div className="mb-4">
                <h4 className="font-medium text-xs sm:text-sm text-gray-900 mb-2">Price Range</h4>
                <div className="space-y-3">
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-xs text-gray-600">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>
              {/* In Stock Filter */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300 rounded"
                  />
                  <span className="ml-1.5 text-[10px] sm:text-xs text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>
          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and View Mode */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-3 sm:mb-4 gap-3">
              <p className="text-[10px] sm:text-xs text-gray-600">
                Showing {filteredAndSortedProducts.length} products in{' '}
                <span className="font-semibold">{selectedCategory}</span>
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 text-[10px] sm:text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)]"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-1.5 text-gray-600 hover:text-[var(--primary-color)]"
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {/* Products */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="text-center text-[10px] sm:text-xs text-gray-500 py-6 sm:py-10">
                No products found.
              </div>
            ) : (
              <div
                className={`${viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4'
                  : 'space-y-2 sm:space-y-3'
                  }`}
              >
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    updateCartCount={updateCartCount}
                    flyToCart={animateFly}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Animation Style */}
      <style jsx>{`
        .cart-bounce {
          animation: cart-bounce-glow 0.4s ease;
        }
        @keyframes cart-bounce-glow {
          0%, 100% { transform: scale(1); box-shadow: none; }
          50% { transform: scale(1.2); box-shadow: 0 0 10px 3px rgba(255, 165, 0, 0.7); }
        }
      `}</style>
    </div>
  );
};

export default ProductsPage;
