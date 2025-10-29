import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function Cart() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    } transition-transform duration-300 ease-in-out`}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Cart</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              Your cart is empty
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.lab}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{item.price}</p>
                    <button
                      onClick={() => setItems(items.filter(i => i.id !== item.id))}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-xl">₹{total}</span>
            </div>
            <button className="w-full btn-primary">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;