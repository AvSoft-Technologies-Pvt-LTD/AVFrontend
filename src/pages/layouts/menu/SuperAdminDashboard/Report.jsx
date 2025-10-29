
import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, BarElement, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import axios from 'axios';
ChartJS.register(ArcElement, BarElement, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler);

const moduleFilters = {
  patients: [
    { id: 'healthIdStatus', label: 'Health ID', type: 'select', options: ['All', 'Issued', 'Not Issued'] },
    { id: 'patientType', label: 'Patient Type', type: 'select', options: ['All', 'Inpatient', 'Outpatient'] },
    { id: 'consultationType', label: 'Consultation', type: 'select', options: ['All', 'Physical', 'Virtual'] },
    { id: 'ageGroup', label: 'Age Group', type: 'select', options: ['All', '0-18', '19-30', '31-50', '51-70', '70+'] },
    { id: 'gender', label: 'Gender', type: 'select', options: ['All', 'Male', 'Female', 'Other'] },
    { id: 'registrationDate', label: 'Registration Date', type: 'date' }
  ],
  doctors: [
    { id: 'specialty', label: 'Specialty', type: 'select', options: ['All', 'Cardiologist', 'Dermatologist', 'Neurologist', 'General', 'Pediatrician', 'Orthopedic', 'Gynecologist'] },
    { id: 'doctorType', label: 'Doctor Type', type: 'select', options: ['All', 'Avasthya Doctor', 'Freelancer', 'Hospital Associated'] },
    { id: 'experience', label: 'Experience', type: 'select', options: ['All', '0-2 years', '3-5 years', '6-10 years', '11-15 years', '15+ years'] },
    { id: 'revenueRange', label: 'Revenue Range', type: 'select', options: ['All', '0-50K', '50K-1L', '1L-2L', '2L-5L', '5L+'] },
    { id: 'rating', label: 'Min Rating', type: 'select', options: ['All', '4+', '3+', '2+', '1+'] },
    { id: 'qualification', label: 'Qualification', type: 'select', options: ['All', 'MBBS', 'MD', 'MS', 'DM', 'DNB'] }
  ],
  pharmacies: [
    { id: 'status', label: 'Status', type: 'select', options: ['All', 'Approved', 'Pending', 'Suspended'] },
    { id: 'state', label: 'State', type: 'select', options: ['All', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Uttar Pradesh'] },
    { id: 'city', label: 'City', type: 'select', options: ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Ahmedabad', 'Kolkata', 'Lucknow', 'Pune', 'Hyderabad'] },
    { id: 'revenueRange', label: 'Revenue Range', type: 'select', options: ['All', '0-1L', '1L-5L', '5L-10L', '10L-25L', '25L+'] },
    { id: 'licenseType', label: 'License Type', type: 'select', options: ['All', 'Retail', 'Wholesale', 'Both'] },
    { id: 'deliveryAvailable', label: 'Delivery', type: 'select', options: ['All', 'Yes', 'No'] }
  ],
  labs: [
    { id: 'testType', label: 'Test Type', type: 'select', options: ['All', 'Blood', 'Urine', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'ECG'] },
    { id: 'revenueRange', label: 'Revenue Range', type: 'select', options: ['All', '0-50K', '50K-1L', '1L-2L', '2L-5L', '5L+'] },
    { id: 'accreditation', label: 'Accreditation', type: 'select', options: ['All', 'NABL', 'ISO', 'CAP', 'None'] },
    { id: 'turnaroundTime', label: 'Max Turnaround Time', type: 'select', options: ['All', '24 hours', '48 hours', '72 hours', '1 week'] },
    { id: 'homeCollection', label: 'Home Collection', type: 'select', options: ['All', 'Available', 'Not Available'] }
  ],
  payments: [
    { id: 'method', label: 'Payment Method', type: 'select', options: ['All', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash', 'Insurance'] },
    { id: 'status', label: 'Status', type: 'select', options: ['All', 'Success', 'Failed', 'Pending', 'Refunded'] },
    { id: 'category', label: 'Category', type: 'select', options: ['All', 'Consultation', 'Medicine', 'Lab Test', 'Procedure'] },
    { id: 'dateRange', label: 'Date Range', type: 'date' }
  ],
  hospitals: [
    { id: 'status', label: 'Status', type: 'select', options: ['All', 'Approved', 'Pending', 'Suspended'] },
    { id: 'type', label: 'Hospital Type', type: 'select', options: ['All', 'Private', 'Public', 'Trust', 'Government'] },
    { id: 'state', label: 'State', type: 'select', options: ['All', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Uttar Pradesh'] },
    { id: 'city', label: 'City', type: 'select', options: ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Ahmedabad', 'Kolkata', 'Lucknow', 'Pune', 'Hyderabad'] },
    { id: 'facilities', label: 'Facilities', type: 'select', options: ['All', 'With Lab', 'With Pharmacy', 'Both', 'None'] },
    { id: 'bedCapacity', label: 'Bed Capacity', type: 'select', options: ['All', '0-50', '51-100', '101-200', '201-500', '500+'] }
  ]
};

const chartConfig = {
  pie: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
  bar: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } },
  line: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, elements: { line: { tension: 0.4 } } }
};

const SuperadminReports = () => {
  const [state, setState] = useState({ selectedModule: 'patients', viewType: 'tabular', reportData: null, loading: false, error: null, filters: {}, pendingFilters: {}, currentPage: 1 });

  const fetchData = useCallback(async (module, filters = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await axios.get('https://mocki.io/v1/2eed4484-da5b-42ce-93b5-4ef918b4bcb2');
      const moduleData = response.data[module];
      if (!moduleData) throw new Error(`Module ${module} not found`);
      const filteredData = { [module]: moduleData[module].filter(item => Object.entries(filters).every(([key, value]) => value === 'All' || !value || item[key] === value)), kpis: moduleData.kpis };
      setState(prev => ({ ...prev, reportData: filteredData, loading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
    }
  }, []);

  useEffect(() => { fetchData(state.selectedModule, state.filters); }, [state.selectedModule, state.filters, fetchData]);

  const renderCharts = (module, data) => {
    if (!data) return null;
    const moduleData = data[module] || [];
    const chartData = moduleData.reduce((acc, item) => { Object.keys(item).forEach(key => { if (!acc[key]) acc[key] = {}; acc[key][item[key]] = (acc[key][item[key]] || 0) + 1; }); return acc; }, {});
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {Object.entries(chartData).slice(0, 4).map(([key, values], index) => (
          <div key={key} className="rounded-xl p-6 card-stat">
            <h3 className="h4-heading mb-4">{key.charAt(0).toUpperCase() + key.slice(1)} Distribution</h3>
            <div className="h-64">
              {index % 2 === 0 ? <Pie data={{ labels: Object.keys(values), datasets: [{ data: Object.values(values), backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f'] }] }} options={chartConfig.pie} /> :
                <Bar data={{ labels: Object.keys(values), datasets: [{ label: 'Count', data: Object.values(values), backgroundColor: '#2980b9' }] }} options={chartConfig.bar} />}
            </div>
          </div>
        ))}
      </div>
    );
  };
   const renderTable = () => {
       if (!state.reportData) return null;
       const data = state.reportData[state.selectedModule] || [];
       const pageSize = 8;
       const totalPages = Math.ceil(data.length / pageSize);
       const pageData = data.slice((state.currentPage - 1) * pageSize, state.currentPage * pageSize);
       
       return (
           <>
               <table className="table-container">
                   <thead>
                       <tr className='table-head'>
                           {Object.keys(data[0] || {}).map(col => (
                               <th key={col} className="p-3 text-left">{col.charAt(0).toUpperCase() + col.slice(1)}</th>
                           ))}
                       </tr>
                   </thead>
                   <tbody className="table-body">
                       {pageData.map((row, i) => (
                           <tr key={i} className="tr-style hover:bg-gray-50">
                               {Object.values(row).map((val, j) => (
                                   <td key={j}>{typeof val === 'number' ? val.toLocaleString() : val?.toString() || ''}</td>
                               ))}
                           </tr>
                       ))}
                   </tbody>
               </table>
               <div className="flex justify-end items-center mt-4">
                   <div className="flex items-center gap-2">
                       <button disabled={state.currentPage === 1} onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))} className="edit-btn">Previous</button>
                       <span>Page {state.currentPage} of {totalPages}</span>
                       <button disabled={state.currentPage === totalPages} onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))} className="edit-btn">Next</button>
                   </div>
               </div>
           </>
       );
   };
  return (
    <div className="min-h-screen p-4">
      <div className="w-full mt-6">
        <div className="bg-[var(--color-surface)] rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div>
              <h2 className="h3-heading">Superadmin Reports</h2>
              <p className="paragraph mt-1">Generate and analyze reports for different modules</p>
            </div>
            <div className="flex items-start gap-3">
              <select value={state.viewType} onChange={(e) => setState(prev => ({ ...prev, viewType: e.target.value }))} className="input-field">
                <option value="tabular">Tabular View</option>
                <option value="charts">Graph View</option>
              </select>
              <button onClick={() => downloadCSV(state.reportData?.[state.selectedModule] || [], `report_${state.selectedModule}.csv`)} className="view-btn text-sm">Export CSV</button>
              <button onClick={() => generatePDF(state.reportData, state.selectedModule)} className="view-btn text-sm">Export PDF</button>
            </div>
          </div>
          {state.error && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6"><p className="text-sm text-red-700">{state.error}</p></div>}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="h4-heading mb-4">Report Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-overlay)] mb-2">Module</label>
                <select value={state.selectedModule} onChange={(e) => setState(prev => ({ ...prev, selectedModule: e.target.value, filters: {} }))} className="input-field">
                  {Object.keys(moduleFilters).map(module => <option key={module} value={module}>{module.charAt(0).toUpperCase() + module.slice(1)}</option>)}
                </select>
              </div>
              {moduleFilters[state.selectedModule]?.map(filter => (
                <div key={filter.id}>
                  <label className="block text-sm font-medium text-[var(--color-overlay)] mb-2">{filter.label}</label>
                  {filter.type === 'select' ? (
                    <select value={state.pendingFilters[filter.id] || 'All'} onChange={(e) => setState(prev => ({ ...prev, pendingFilters: { ...prev.pendingFilters, [filter.id]: e.target.value } }))} className="input-field">
                      {filter.options.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : filter.type === 'date' ? (
                    <input type="date" value={state.pendingFilters[filter.id] || ''} onChange={(e) => setState(prev => ({ ...prev, pendingFilters: { ...prev.pendingFilters, [filter.id]: e.target.value } }))} className="input-field" />
                  ) : (
                    <input type="number" value={state.pendingFilters[filter.id] || ''} onChange={(e) => setState(prev => ({ ...prev, pendingFilters: { ...prev.pendingFilters, [filter.id]: e.target.value } }))} min={filter.min} max={filter.max} placeholder={`Enter ${filter.label.toLowerCase()}`} className="input-field" />
                  )}
                </div>
              ))}
              <div className="flex items-end">
                <button onClick={() => setState(prev => ({ ...prev, filters: prev.pendingFilters }))} className="btn btn-primary w-full">Generate Report</button>
              </div>
            </div>
          </div>
        </div>
        {state.loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="mb-4">{state.viewType === 'tabular' ? renderTable() : renderCharts(state.selectedModule, state.reportData)}</div>
        )}
      </div>
    </div>
  );
};

export default SuperadminReports;
