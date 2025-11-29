import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaSearch,
  FaPlus,
  FaBox,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaShoppingCart,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowDown
} from 'react-icons/fa';
import ReusableModal from '../../../../components/microcomponents/Modal';

const mockInventory = [
  {
    id: 1,
    name: 'Complete Blood Count (CBC) Kit',
    category: 'Hematology',
    stock: 45,
    minThreshold: 50,
    maxCapacity: 200,
    expiryDate: '2024-12-31',
    status: 'low',
    unitPrice: 150,
    supplier: 'MediSupply Co.',
  },
  {
    id: 2,
    name: 'Lipid Profile Test Kit',
    category: 'Biochemistry',
    stock: 120,
    minThreshold: 50,
    maxCapacity: 200,
    expiryDate: '2025-06-30',
    status: 'ok',
    unitPrice: 200,
    supplier: 'BioTest Inc.',
  },
  {
    id: 3,
    name: 'Thyroid Function Test (TFT) Kit',
    category: 'Endocrinology',
    stock: 32,
    minThreshold: 30,
    maxCapacity: 150,
    expiryDate: '2024-03-15',
    status: 'expiring',
    unitPrice: 250,
    supplier: 'LabTech Solutions',
  },
  {
    id: 4,
    name: 'Liver Function Test (LFT) Kit',
    category: 'Biochemistry',
    stock: 85,
    minThreshold: 40,
    maxCapacity: 180,
    expiryDate: '2025-08-20',
    status: 'ok',
    unitPrice: 180,
    supplier: 'MediSupply Co.',
  },
  {
    id: 5,
    name: 'Blood Glucose Test Strips',
    category: 'Diabetes',
    stock: 15,
    minThreshold: 100,
    maxCapacity: 500,
    expiryDate: '2024-10-10',
    status: 'critical',
    unitPrice: 50,
    supplier: 'GlucoTest Ltd.',
  },
  {
    id: 6,
    name: 'Kidney Function Test (KFT) Kit',
    category: 'Nephrology',
    stock: 95,
    minThreshold: 40,
    maxCapacity: 150,
    expiryDate: '2025-12-31',
    status: 'ok',
    unitPrice: 190,
    supplier: 'BioTest Inc.',
  },
];

const statusConfig = {
  ok: {
    label: 'OK',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <FaCheckCircle className="inline mr-1" />,
  },
  low: {
    label: 'Low Stock',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <FaExclamationTriangle className="inline mr-1" />,
  },
  critical: {
    label: 'Critical',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <FaTimesCircle className="inline mr-1" />,
  },
  expiring: {
    label: 'Expiring Soon',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <FaCalendarAlt className="inline mr-1" />,
  },
};

const CATEGORIES = ['Hematology', 'Biochemistry', 'Endocrinology', 'Diabetes', 'Nephrology'];

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inventory, setInventory] = useState(mockInventory);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    stock: 0,
    minThreshold: 0,
    maxCapacity: 0,
    expiryDate: '',
    unitPrice: 0,
    supplier: ''
  });

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleReorder = (item) => {
    toast.success(`Reorder request initiated for ${item.name}`);
  };

  const getStockPercentage = (stock, maxCapacity) => {
    return (stock / maxCapacity) * 100;
  };

  const handleAddItem = (formData) => {
    const newId = Math.max(0, ...inventory.map(item => item.id)) + 1;
    const status = formData.stock < formData.minThreshold * 0.5 ? 'critical' : 
                  formData.stock < formData.minThreshold ? 'low' : 'ok';
    
    const itemToAdd = {
      ...formData,
      id: newId,
      status,
      stock: Number(formData.stock),
      minThreshold: Number(formData.minThreshold),
      maxCapacity: Number(formData.maxCapacity),
      unitPrice: Number(formData.unitPrice)
    };

    setInventory([...inventory, itemToAdd]);
    setIsModalOpen(false);
    toast.success('Item added successfully!');
  };

  const lowStockCount = inventory.filter(i => i.status === 'low' || i.status === 'critical').length;
  const expiringCount = inventory.filter(i => i.status === 'expiring').length;
  const totalValue = inventory.reduce((sum, i) => sum + (i.stock * i.unitPrice), 0);

  return (
    <div className="p-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5">
        <div className="mb-4 md:mb-0">
          <h1 className="h4-heading">Inventory Management</h1>
          <p className=" text-xs text-[var(--primary-color)]/80">Track and manage lab test kits and supplies</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg  shadow-sm"
        >
          <FaPlus /> Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search test kits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--primary-color)]/5 rounded-lg "
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-[var(--primary-color)]/5 rounded-lg  "
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[var(--primary-color)]/5 rounded-lg "
          >
            <option value="all">All Status</option>
            <option value="ok">OK</option>
            <option value="low">Low Stock</option>
            <option value="critical">Critical</option>
            <option value="expiring">Expiring Soon</option>
          </select>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map((item) => {
          const stockPercentage = getStockPercentage(item.stock, item.maxCapacity);
          const needsReorder = item.stock < item.minThreshold;
          
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-[var(--primary-color)]">{item.name}</h3>
                  <p className="text-[var(--primary-color)]/80 text-sm">{item.category}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[item.status].color}`}>
                  {statusConfig[item.status].icon} {statusConfig[item.status].label}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--primary-color)]/80">Stock Level</span>
                  <span className="font-medium">{item.stock} / {item.maxCapacity} units</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      stockPercentage < 30 ? 'bg-red-500' : stockPercentage < 70 ? 'bg-yellow-500' : '[var(--accent-color)]'
                    }`} 
                    style={{ width: `${Math.min(100, stockPercentage)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Min: {item.minThreshold}</span>
                  <span>Max: {item.maxCapacity}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Unit Price</p>
                  <p className="font-semibold">₹{item.unitPrice}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Total Value</p>
                  <p className="font-semibold">₹{(item.stock * item.unitPrice).toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[var(--primary-color)]/80">Expiry Date:</span>
                  <span>{item.expiryDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--primary-color)]/80">Supplier:</span>
                  <span className="font-medium">{item.supplier}</span>
                </div>
              </div>

              {needsReorder && (
                <button
                  onClick={() => handleReorder(item)}
                  className="w-full mt-4 btn btn-primary rounded-lg flex items-center justify-center gap-2"
                >
                  <FaShoppingCart /> Auto Reorder
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Alerts Section */}
      {(lowStockCount > 0 || expiringCount > 0) && (
        <div className="bg-white p-4 rounded-lg shadow-sm mt-6 border-l-4 border-yellow-400">
          <h3 className="text-yellow-700 font-medium flex items-center gap-2 mb-3">
            <FaExclamationTriangle /> Inventory Alerts
          </h3>
          <div className="space-y-3">
            {lowStockCount > 0 && (
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
                <p className="text-yellow-800 font-medium flex items-center gap-2">
                  <FaExclamationTriangle /> Low Stock Alert
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {lowStockCount} items are below minimum threshold and need reordering.
                </p>
              </div>
            )}
            {expiringCount > 0 && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <p className="text-blue-800 font-medium flex items-center gap-2">
                  <FaCalendarAlt /> Expiry Alert
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {expiringCount} items are expiring within 3 months.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="add"
        title="Add New Inventory Item"
        data={newItem}
        onSave={handleAddItem}
        saveLabel="Add Item"
        cancelLabel="Cancel"
        fields={[
          {
            name: 'name',
            label: 'Item Name',
            type: 'text',
            placeholder: 'Enter item name',
            required: true,
            colSpan: 2
          },
          {
            name: 'category',
            label: 'Category',
            type: 'select',
            options: CATEGORIES.map(cat => ({ value: cat, label: cat })),
            required: true
          },
          {
            name: 'stock',
            label: 'Current Stock',
            type: 'number',
            min: 0,
            required: true
          },
          {
            name: 'minThreshold',
            label: 'Minimum Threshold',
            type: 'number',
            min: 0,
            required: true
          },
          {
            name: 'maxCapacity',
            label: 'Maximum Capacity',
            type: 'number',
            min: 0,
            required: true
          },
          {
            name: 'expiryDate',
            label: 'Expiry Date',
            type: 'date',
            required: true
          },
          {
            name: 'unitPrice',
            label: 'Unit Price (₹)',
            type: 'number',
            min: 0,
            step: 0.01,
            required: true,
            prefix: '₹'
          },
          {
            name: 'supplier',
            label: 'Supplier',
            type: 'text',
            placeholder: 'Enter supplier name',
            required: true,
            colSpan: 2
          }
        ]}
        size="md"
        showSuccessToast={false}
        preventCloseOnSave={false}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}