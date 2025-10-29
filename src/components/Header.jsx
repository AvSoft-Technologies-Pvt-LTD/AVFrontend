import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

function Header() {
  return (
    <header className="bg-royal-blue text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            LabTest
          </Link>
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 px-4 py-2 bg-mustard text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors">
              <span>Upload Prescription</span>
            </button>
            <Link to="/cart" className="relative">
              <ShoppingCartIcon className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-mustard text-xs text-gray-900 w-5 h-5 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;