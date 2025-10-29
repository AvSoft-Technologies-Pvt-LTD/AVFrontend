import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import ReusableModal from "./microcomponents/Modal";
import DynamicTable from "./microcomponents/DynamicTable";

const PharmacyModule = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [modalType, setModalType] = useState("");
  const [selectedData, setSelectedData] = useState({});

  // Sample data for each tab
  const [salesData, setSalesData] = useState([
    {
      id: 1,
      treatmentId: "TR001",
      patientName: "John Doe",
      patientType: "Regular",
      referenceNo: "REF001",
      billType: "Retail",
      transactionDate: "2024-01-15",
      invoice: "INV001",
      status: "Completed",
      isWholesale: "No",
      totalAmount: 250.0,
      paidAmount: 250.0,
      dueAmount: 0.0,
    },
    {
      id: 2,
      treatmentId: "TR002",
      patientName: "Jane Smith",
      patientType: "Insurance",
      referenceNo: "REF002",
      billType: "Wholesale",
      transactionDate: "2024-01-16",
      invoice: "INV002",
      status: "Pending",
      isWholesale: "Yes",
      totalAmount: 450.0,
      paidAmount: 400.0,
      dueAmount: 50.0,
    },
    {
      id: 3,
      treatmentId: "TR003",
      patientName: "Mike Johnson",
      patientType: "Regular",
      referenceNo: "REF003",
      billType: "Retail",
      transactionDate: "2024-01-17",
      invoice: "INV003",
      status: "Completed",
      isWholesale: "No",
      totalAmount: 180.0,
      paidAmount: 180.0,
      dueAmount: 0.0,
    },
  ]);

  const [purchaseData, setPurchaseData] = useState([
    {
      id: 1,
      transactionType: "Purchase",
      transactionDate: "2024-01-15",
      supplierName: "MediCorp Ltd",
      refNo: "PUR001",
      productItem: "Paracetamol 500mg",
      stockBalance: 100,
      quantity: 50,
      rate: 15.5,
      boxQuantity: 5,
      expireDate: "2025-12-31",
      totalAmount: 775.0,
      discountPercent: 5,
      discountAmount: 38.75,
      amountToBePaid: 736.25,
      givenAmount: 800.0,
      paidAmount: 736.25,
      dueAmount: 63.75,
      status: "Completed",
    },
    {
      id: 2,
      transactionType: "Purchase",
      transactionDate: "2024-01-16",
      supplierName: "Pharma Supply Co",
      refNo: "PUR002",
      productItem: "Ibuprofen 400mg",
      stockBalance: 75,
      quantity: 30,
      rate: 20.0,
      boxQuantity: 3,
      expireDate: "2025-11-30",
      totalAmount: 600.0,
      discountPercent: 3,
      discountAmount: 18.0,
      amountToBePaid: 582.0,
      givenAmount: 600.0,
      paidAmount: 582.0,
      dueAmount: 18.0,
      status: "Completed",
    },
  ]);

  const [inventoryData, setInventoryData] = useState([
    {
      id: 1,
      productId: "MED001",
      productName: "Paracetamol 500mg",
      categoryName: "Analgesics",
      sizeDesc: "500mg Tablet",
      alert: "Low Stock",
      totalBalance: 45,
      salePrice: 25.0,
      buyPrice: 15.5,
      avgBuyPrice: 16.0,
      discountPercent: 5,
      minLevel: 50,
      numStripBox: 10,
      qtyStrip: 10,
      stockBox: 4,
      currentStockPrice: 720.0,
      expireDate: "2025-12-31",
    },
    {
      id: 2,
      productId: "MED002",
      productName: "Ibuprofen 400mg",
      categoryName: "Anti-inflammatory",
      sizeDesc: "400mg Tablet",
      alert: "In Stock",
      totalBalance: 120,
      salePrice: 30.0,
      buyPrice: 20.0,
      avgBuyPrice: 21.0,
      discountPercent: 3,
      minLevel: 30,
      numStripBox: 15,
      qtyStrip: 8,
      stockBox: 15,
      currentStockPrice: 2520.0,
      expireDate: "2025-11-30",
    },
  ]);

  // Modal handlers
  const openModal = (type, data = {}) => {
    setModalType(type);
    setSelectedData(data);
    setModalMode(
      ["createSale", "createWholesale", "createPurchase", "createInventory"].includes(type)
        ? "add"
        : type === "edit"
        ? "edit"
        : type === "confirmDelete"
        ? "confirmDelete"
        : type === "view"
        ? "viewProfile"
        : modalMode
    );
    setIsModalOpen(true);
  };

  const handleView = (row) => {
    openModal("view", row);
  };

  const handleSave = (data) => {
    if (modalMode === "add") {
      switch (activeTab) {
        case "sales":
          setSalesData(prev => [...prev, { id: prev.length + 1, ...data }]);
          break;
        case "purchase":
          setPurchaseData(prev => [...prev, { id: prev.length + 1, ...data }]);
          break;
        case "inventory":
          setInventoryData(prev => [...prev, { id: prev.length + 1, ...data }]);
          break;
        default:
          break;
      }
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    console.log("Deleting data:", selectedData);
    setIsModalOpen(false);
  };

  // Export functionality
  const handleExport = (type) => {
    let dataToExport = [];
    let filename = "";
    let columns = [];

    switch (type) {
      case "sales":
        dataToExport = salesData;
        columns = salesColumns;
        filename = `Sales_Summary_${new Date().toISOString().split("T")[0]}.csv`;
        break;
      case "purchase":
        dataToExport = purchaseData;
        columns = purchaseColumns;
        filename = `Purchase_Summary_${new Date().toISOString().split("T")[0]}.csv`;
        break;
      case "inventory":
        dataToExport = inventoryData;
        columns = inventoryColumns;
        filename = `Inventory_Report_${new Date().toISOString().split("T")[0]}.csv`;
        break;
      default:
        return;
    }

    // Format data as CSV
    const headers = columns.map(col => col.header);
    const rows = dataToExport.map(row =>
      columns.map(col => {
        if (col.cell) {
          return typeof col.cell(row) === "string"
            ? col.cell(row)
            : row[col.accessor];
        }
        return row[col.accessor];
      })
    );
    const csvContent =
      [headers.join(",")]
        .concat(rows.map(r => r.map(val => `"${val}"`).join(",")))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Table columns for each tab
  const salesColumns = [
    { header: "Treatment ID", accessor: "treatmentId" },
    {
      header: "Patient Name",
      accessor: "patientName",
      cell: (row) => (
        <button
          type="button"
          className="text-[var(--primary-color)] hover:text-[var(--accent-color)] underline cursor-pointer font-medium"
          onClick={() => handleView(row)}
          title="View Details"
        >
          {row.patientName}
        </button>
      ),
    },
    { header: "Bill Type", accessor: "billType" },
    { header: "Transaction Date", accessor: "transactionDate" },
    {
      header: "Invoice",
      accessor: "invoice",
      cell: (row) => (
        <button
          type="button"
          className="text-[var(--primary-color)] hover:text-[var(--accent-color)] underline cursor-pointer font-medium"
          onClick={() => handleView(row)}
          title="View Invoice"
        >
          {row.invoice}
        </button>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`status-badge ${
            row.status === "Completed" ? "status-completed" : "status-pending"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Total Amount",
      accessor: "totalAmount",
      cell: (row) => {
        const value = row.totalAmount;
        return typeof value === "number" ? `$${value.toFixed(2)}` : value ? `$${parseFloat(value).toFixed(2)}` : "-";
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal("edit", row)}
            className="edit-btn hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => openModal("confirmDelete", row)}
            className="delete-btn hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const purchaseColumns = [
    { header: "Date", accessor: "transactionDate" },
    {
      header: "Supplier Name",
      accessor: "supplierName",
      cell: (row) => (
        <button
          type="button"
          className="text-[var(--primary-color)] hover:text-[var(--accent-color)] underline cursor-pointer font-medium"
          onClick={() => handleView(row)}
          title="View Supplier Details"
        >
          {row.supplierName}
        </button>
      ),
    },
    { header: "Product Name", accessor: "productItem" },
    { header: "Quantity", accessor: "quantity" },
    {
      header: "Rate",
      accessor: "rate",
      cell: (row) => {
        const value = row.rate;
        return typeof value === "number"
          ? `$${value.toFixed(2)}`
          : value
          ? `$${parseFloat(value).toFixed(2)}`
          : "-";
      },
    },
    {
      header: "Total Amount",
      accessor: "totalAmount",
      cell: (row) => {
        const value = row.totalAmount;
        return typeof value === "number" ? `$${value.toFixed(2)}` : value ? `$${parseFloat(value).toFixed(2)}` : "-";
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal("edit", row)}
            className="edit-btn hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => openModal("confirmDelete", row)}
            className="delete-btn hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const inventoryColumns = [
    { header: "Product ID", accessor: "productId" },
    {
      header: "Product Name",
      accessor: "productName",
      cell: (row) => (
        <button
          type="button"
          className="text-[var(--primary-color)] hover:text-[var(--accent-color)] underline cursor-pointer font-medium"
          onClick={() => handleView(row)}
          title="View Product Details"
        >
          {row.productName}
        </button>
      ),
    },
    { header: "Category", accessor: "categoryName" },
    {
      header: "Alert",
      accessor: "alert",
      cell: (row) => (
        <span
          className={`status-badge ${
            row.alert === "Low Stock" ? "status-pending" : "status-completed"
          }`}
        >
          {row.alert}
        </span>
      ),
    },
    {
      header: "Sale Price",
      accessor: "salePrice",
      cell: (row) => {
        const price = parseFloat(row.salePrice);
        return isNaN(price) ? "-" : `$${price.toFixed(2)}`;
      },
    },
    {
      header: "Buy Price",
      accessor: "buyPrice",
      cell: (row) => {
        const price = parseFloat(row.buyPrice);
        return isNaN(price) ? "-" : `$${price.toFixed(2)}`;
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal("edit", row)}
            className="edit-btn hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => openModal("confirmDelete", row)}
            className="delete-btn hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // Modal field definitions
  const saleModalFields = [
    {
      name: "transType",
      label: "Trans Type",
      type: "select",
      options: [
        { value: "retail", label: "Retail" },
        { value: "wholesale", label: "Wholesale" },
      ],
    },
    {
      name: "saleType",
      label: "Sale Type",
      type: "select",
      options: [
        { value: "retail", label: "Retail" },
        { value: "wholesale", label: "Wholesale" },
      ],
    },
    { name: "date", label: "Date", type: "date" },
    {
      name: "customer",
      label: "Customer / Client",
      type: "text",
    },
    { name: "barcode", label: "Barcode", type: "text" },
    {
      name: "productItem",
      label: "Product Item",
      type: "select",
      options: [
        { value: "paracetamol", label: "Paracetamol 500mg" },
        { value: "ibuprofen", label: "Ibuprofen 400mg" },
      ],
    },
    { name: "stock", label: "Stock", type: "number" },
    { name: "itemType", label: "Item Type", type: "text" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "unitPrice", label: "Unit Price", type: "number" },
    { name: "discPercent", label: "Disc %", type: "number" },
    { name: "unitDisc", label: "Unit Disc", type: "number" },
    { name: "finalPrice", label: "Final Price", type: "number" },
    { name: "gstVat", label: "GST / VAT %", type: "number" },
    { name: "totalAmount", label: "Total Amount", type: "number" },
    { name: "serviceCharges", label: "Service Charges", type: "number" },
    { name: "discount", label: "Discount (%)", type: "number" },
    { name: "payableAmount", label: "Payable Amount", type: "number" },
    { name: "givenAmount", label: "Given Amount", type: "number" },
    { name: "paidAmount", label: "Paid Amount", type: "number" },
    { name: "dueReturn", label: "Due / Return", type: "number" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "final", label: "Final" },
        { value: "pending", label: "Pending" },
      ],
    },
  ];

  const wholesaleModalFields = [
    {
      name: "transType",
      label: "Trans Type",
      type: "select",
      options: [{ value: "wholesale", label: "Wholesale" }],
    },
    { name: "date", label: "Date", type: "date" },
    {
      name: "clientName",
      label: "Client Name",
      type: "select",
      options: [
        { value: "medic_corp", label: "MediCorp Ltd" },
        { value: "pharma_plus", label: "Pharma Plus" },
      ],
    },
    {
      name: "productItem",
      label: "Product Item",
      type: "select",
      options: [
        { value: "paracetamol", label: "Paracetamol 500mg" },
        { value: "ibuprofen", label: "Ibuprofen 400mg" },
      ],
    },
    { name: "stock", label: "Stock", type: "number" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "rate", label: "Rate", type: "number" },
    { name: "discPercent", label: "Disc %", type: "number" },
    { name: "discount", label: "Discount", type: "number" },
    { name: "totalAmount", label: "Total Amount", type: "number" },
    { name: "discountPercent", label: "Discount %", type: "number" },
    { name: "discountAdjust", label: "Discount/Adjust", type: "number" },
    { name: "payableAmount", label: "Payable Amount", type: "number" },
    { name: "givenAmount", label: "Given Amount", type: "number" },
    { name: "paidAmount", label: "Paid Amount", type: "number" },
    { name: "dueReturn", label: "Due/Return", type: "number" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "final", label: "Final" },
        { value: "pending", label: "Pending" },
      ],
    },
  ];

  const purchaseModalFields = [
    {
      name: "transactionType",
      label: "Transaction Type",
      type: "select",
      options: [{ value: "purchase", label: "Purchase" }],
    },
    { name: "date", label: "Date", type: "date" },
    {
      name: "supplierName",
      label: "Supplier Name",
      type: "select",
      options: [
        { value: "medic_corp", label: "MediCorp Ltd" },
        { value: "pharma_supply", label: "Pharma Supply Co" },
      ],
    },
    { name: "refNo", label: "Ref No", type: "text" },
    {
      name: "productItem",
      label: "Product Item",
      type: "select",
      options: [
        { value: "paracetamol", label: "Paracetamol 500mg" },
        { value: "ibuprofen", label: "Ibuprofen 400mg" },
      ],
    },
    { name: "stockBalance", label: "Stock Balance", type: "number" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "rate", label: "Rate", type: "number" },
    { name: "boxQuantity", label: "Box Quantity", type: "number" },
    { name: "expireDate", label: "Expire Date", type: "date" },
    { name: "totalAmount", label: "Total Amount", type: "number" },
    { name: "discountPercent", label: "Discount %", type: "number" },
    {
      name: "discountAdjustment",
      label: "Discount / Adjustment",
      type: "number",
    },
    { name: "amountToBePaid", label: "Amount To Be Paid", type: "number" },
    { name: "givenAmount", label: "Given Amount", type: "number" },
    { name: "paidAmount", label: "Paid Amount", type: "number" },
    { name: "dueReturn", label: "Due / Return", type: "number" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "final", label: "Final" },
        { value: "pending", label: "Pending" },
      ],
    },
  ];

  const inventoryModalFields = [
    { name: "productId", label: "Product ID", type: "text" },
    { name: "productName", label: "Product Name", type: "text" },
    { name: "categoryName", label: "Category Name", type: "text" },
    { name: "sizeDesc", label: "Size Description", type: "text" },
    {
      name: "alert",
      label: "Alert",
      type: "select",
      options: [
        { value: "low_stock", label: "Low Stock" },
        { value: "in_stock", label: "In Stock" },
        { value: "out_of_stock", label: "Out of Stock" },
      ],
    },
    { name: "totalBalance", label: "Total Balance", type: "number" },
    { name: "salePrice", label: "Sale Price", type: "number" },
    { name: "buyPrice", label: "Buy Price", type: "number" },
    { name: "avgBuyPrice", label: "Avg Buy Price", type: "number" },
    { name: "discountPercent", label: "Discount %", type: "number" },
    { name: "minLevel", label: "Min Level", type: "number" },
    { name: "numStripBox", label: "Num Strip/Box", type: "number" },
    { name: "qtyStrip", label: "Qty Strip", type: "number" },
    { name: "stockBox", label: "Stock Box", type: "number" },
    { name: "currentStockPrice", label: "Current Stock Price", type: "number" },
    { name: "expireDate", label: "Expire Date", type: "date" },
  ];

  // View fields for different modals
  const salesViewFields = [
    { key: "treatmentId", label: "Treatment ID", initialsKey: true },
    { key: "patientName", label: "Patient Name", titleKey: true },
    { key: "patientType", label: "Patient Type", subtitleKey: true },
    { key: "referenceNo", label: "Reference No" },
    { key: "billType", label: "Bill Type" },
    { key: "transactionDate", label: "Transaction Date" },
    { key: "invoice", label: "Invoice" },
    { key: "status", label: "Status" },
    { key: "isWholesale", label: "Wholesale" },
    { key: "totalAmount", label: "Total Amount" },
    { key: "paidAmount", label: "Paid Amount" },
    { key: "dueAmount", label: "Due Amount" },
  ];

  const purchaseViewFields = [
    { key: "supplierName", label: "Supplier Name", initialsKey: true, titleKey: true },
    { key: "productItem", label: "Product Item", subtitleKey: true },
    { key: "status", label: "Status" },
    { key: "transactionType", label: "Transaction Type" },
    { key: "refNo", label: "Ref No" },
    { key: "transactionDate", label: "Date" },
    { key: "stockBalance", label: "Stock Balance" },
    { key: "quantity", label: "Quantity" },
    { key: "rate", label: "Rate" },
    { key: "boxQuantity", label: "Box Quantity" },
    { key: "expireDate", label: "Expire Date" },
    { key: "totalAmount", label: "Total Amount" },
  ];

  const inventoryViewFields = [
    { key: "productId", label: "Product ID", initialsKey: true },
    { key: "productName", label: "Product Name", titleKey: true },
    { key: "categoryName", label: "Category", subtitleKey: true },
    { key: "sizeDesc", label: "Size Description" },
    { key: "alert", label: "Alert" },
    { key: "totalBalance", label: "Total Balance" },
    { key: "minLevel", label: "Min Level" },
    { key: "salePrice", label: "Sale Price" },
    { key: "buyPrice", label: "Buy Price" },
    { key: "avgBuyPrice", label: "Avg Buy Price" },
    { key: "expireDate", label: "Expire Date" },
  ];

  const getModalConfig = () => {
    switch (modalType) {
      case "createSale":
        return {
          title: "Create Sale",
          fields: saleModalFields,
          saveLabel: "Save Sale",
        };
      case "createWholesale":
        return {
          title: "Create Wholesale",
          fields: wholesaleModalFields,
          saveLabel: "Save Wholesale",
        };
      case "createPurchase":
        return {
          title: "Create Purchase",
          fields: purchaseModalFields,
          saveLabel: "Save Purchase",
        };
      case "createInventory":
        return {
          title: "Create Inventory",
          fields: inventoryModalFields,
          saveLabel: "Save Inventory",
        };
      case "view":
        let viewFields = [];
        switch (activeTab) {
          case "sales":
            viewFields = salesViewFields;
            break;
          case "purchase":
            viewFields = purchaseViewFields;
            break;
          case "inventory":
            viewFields = inventoryViewFields;
            break;
          default:
            viewFields = [];
        }
        return {
          title: `${getTabLabel()} Details`,
          fields: [],
          viewFields: viewFields,
          saveLabel: "Close",
        };
      case "edit":
        let editFields = [];
        switch (activeTab) {
          case "sales":
            editFields = saleModalFields;
            break;
          case "purchase":
            editFields = purchaseModalFields;
            break;
          case "inventory":
            editFields = inventoryModalFields;
            break;
          default:
            editFields = [];
        }
        return {
          title: `Edit ${getTabLabel()}`,
          fields: editFields,
          saveLabel: "Update",
        };
      case "confirmDelete":
        return {
          title: "Confirm Delete",
          fields: [],
          saveLabel: "Delete",
          deleteLabel: "Yes, Delete",
        };
      default:
        return {
          title: "Modal",
          fields: [],
          saveLabel: "Save",
        };
    }
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case "sales":
        return "Sales";
      case "purchase":
        return "Purchase";
      case "inventory":
        return "Inventory";
      default:
        return "";
    }
  };

  // Define combined filters for each tab
  const filter = {
    sales: [
      {
        key: "combinedFilter",
        label: "Filter",
        options: [
          ...[...new Set(salesData.map(item => item.patientType))].map(type => ({
            value: type,
            label: type,
          })),
          ...[...new Set(salesData.map(item => item.status))].map(status => ({
            value: status,
            label: status,
          })),
        ],
      },
    ],
    purchase: [
      {
        key: "combinedFilter",
        label: "Filter",
        options: [
          ...[...new Set(purchaseData.map(item => item.supplierName))].map(name => ({
            value: name,
            label: name,
          })),
          ...[...new Set(purchaseData.map(item => item.status))].map(status => ({
            value: status,
            label: status,
          })),
        ],
      },
    ],
    inventory: [
      {
        key: "combinedFilter",
        label: "Filter",
        options: [
          ...[...new Set(inventoryData.map(item => item.categoryName))].map(cat => ({
            value: cat,
            label: cat,
          })),
          ...[...new Set(inventoryData.map(item => item.alert))].map(alert => ({
            value: alert,
            label: alert,
          })),
        ],
      },
    ],
  };

  // Add download actions to each tab
  const tabConfig = {
    sales: {
      label: "Pharmacy Sales List",
      columns: salesColumns,
      data: salesData,
      filters: filter.sales,
      actions: [
        {
          label: "Create Sale",
          onClick: () => openModal("createSale"),
          className: "btn btn-primary",
        },
        {
          label: "Create Wholesale",
          onClick: () => openModal("createWholesale"),
          className: "btn btn-primary",
        },
        {
          label: "Download Summary",
          onClick: () => handleExport("sales"),
          className: "btn btn-secondary",
        },
      ],
    },
    purchase: {
      label: "Pharmacy Purchase List",
      columns: purchaseColumns,
      data: purchaseData,
      filters: filter.purchase,
      actions: [
        {
          label: "Create Purchase",
          onClick: () => openModal("createPurchase"),
          className: "btn btn-primary",
        },
        {
          label: "Download Summary",
          onClick: () => handleExport("purchase"),
          className: "btn btn-secondary",
        },
      ],
    },
    inventory: {
      label: "Inventory List",
      columns: inventoryColumns,
      data: inventoryData,
      filters: filter.inventory,
      actions: [
        {
          label: "Create Inventory",
          onClick: () => openModal("createInventory"),
          className: "btn btn-primary",
        },
        {
          label: "Download Summary",
          onClick: () => handleExport("inventory"),
          className: "btn btn-secondary",
        },
      ],
    },
  };

  const currentTab = tabConfig[activeTab];
  const modalConfig = getModalConfig();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6">
        <h1 className="h4-heading">Pharmacy Management System</h1>

      </div>

      {/* Tabs & Content */}
      <div>
        <div>
          {/* Tabs */}

      <div className="flex flex-wrap items-center justify-between px-6 mb-2 border-gray-200">
        {/* Tabs Section - LabModule style */}
        <div className="flex flex-wrap items-center gap-6">
          {Object.entries(tabConfig).map(([key, tab]) => {
            // Optionally add icons if you want, else just use tab.label
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative flex items-center gap-2 px-2 pb-2 font-medium transition-all duration-200 border-b-2
                  ${activeTab === key
                    ? "text-[var(--primary-color)] border-[var(--primary-color)] border-b-2"
                    : "text-gray-500 border-transparent hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]"
                  }`}
                style={{ background: "none", outline: "none" }}
              >
                {/* If you want icons, add here: tab.icon && React.createElement(tab.icon, { size: 18 }) */}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Actions Section */}
        {currentTab.actions?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
            {currentTab.actions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className={`text-sm font-medium px-4 py-2 rounded-md border ${action.className}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>


          <div className="p-6">
            {/* <div className="mb-6">
              <h2 className="h3-heading mb-4">{currentTab.label}</h2>
            </div> */}

            {/* Table Container */}
            <div>
              <DynamicTable
                columns={currentTab.columns}
                data={currentTab.data}
                onCellClick={(row, col) => {
                  if (col.clickable) handleView(row);
                }}
                filters={currentTab.filters || []}
                tabs={currentTab.tabs || []}
                tabActions={currentTab.actions || []}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        title={modalConfig.title}
        data={selectedData}
        fields={modalConfig.fields}
        viewFields={modalConfig.viewFields}
        saveLabel={modalConfig.saveLabel}
        deleteLabel={modalConfig.deleteLabel}
        onSave={
          modalMode === "confirmDelete" ? handleDeleteConfirm : handleSave
        }
        onDelete={handleDeleteConfirm}
        size="lg"
      />
    </div>
  );
};

export default PharmacyModule;