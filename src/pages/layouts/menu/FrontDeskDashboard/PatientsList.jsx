import { useState } from 'react';
import { UserPlus, Plus, Eye, FileText, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DynamicTable from '../../../../components/microcomponents/DynamicTable';

export default function PatientsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const [patients] = useState([
    {
      id: 1,
      patientId: 'P-1001',
      name: 'Rajesh Kumar Sharma',
      phone: '9876543210',
      aadhar: 'XXXX XXXX 4567',
      age: 34,
      gender: 'Male',
      tokenNumber: 'T-101',
      registeredOn: '2024-06-15'
    },
    {
      id: 2,
      patientId: 'P-1002',
      name: 'Priya Patel',
      phone: '9876543211',
      aadhar: 'XXXX XXXX 8901',
      age: 28,
      gender: 'Female',
      tokenNumber: 'T-102',
      registeredOn: '2024-08-20'
    },
    {
      id: 3,
      patientId: 'P-1003',
      name: 'Amit Desai',
      phone: '9876543212',
      aadhar: 'XXXX XXXX 2345',
      age: 45,
      gender: 'Male',
      tokenNumber: 'T-103',
      registeredOn: '2023-12-10'
    },
    {
      id: 4,
      patientId: 'P-1004',
      name: 'Sunita Sharma',
      phone: '9876543213',
      aadhar: 'XXXX XXXX 6789',
      age: 52,
      gender: 'Female',
      tokenNumber: 'T-104',
      registeredOn: '2024-03-05'
    },
    {
      id: 5,
      patientId: 'P-1005',
      name: 'Vikram Singh',
      phone: '9876543214',
      aadhar: 'XXXX XXXX 3456',
      age: 39,
      gender: 'Male',
      tokenNumber: 'T-105',
      registeredOn: '2024-11-22'
    },
  ]);

  const handleRegisterNewPatient = () => {
    navigate('/frontdeskdashboard/new-patient');
  };

  const handleViewProfile = (patientId) => {
    navigate(`/frontdesk/patients/${patientId}`);
  };

  const handleViewRecords = (patientId) => {
    navigate(`/frontdesk/patients/${patientId}/records`);
  };

  const handleCreateMaster = () => {
    // Add your create master logic here
    console.log('Create master clicked');
  };

  const tabActions = [
    {
      label: "New Patient",
      icon: <Plus className="w-4 h-4" />,
      onClick: handleRegisterNewPatient,
      className: "bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white",
    },
  ];

  const filteredPatients = patients.filter(patient => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      patient.patientId.toLowerCase().includes(searchLower) ||
      patient.phone.includes(searchQuery) ||
      patient.aadhar.includes(searchQuery)
    );
  });

  const columns = [
    {
      header: 'Patient ID',
      accessor: 'patientId',
      Cell: ({ value }) => (
        <span className="font-semibold text-[var(--primary-color)]">{value}</span>
      ),
    },
    {
      header: 'Name',
      accessor: 'name',
      Cell: ({ value }) => (
        <div className="font-semibold text-gray-800">{value}</div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'phone',
      Cell: ({ value }) => (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      header: 'Aadhar',
      accessor: 'aadhar',
      Cell: ({ value }) => (
        <span className="text-sm text-gray-600 font-mono">{value}</span>
      ),
    },
    {
      header: 'Age/Gender',
      accessor: (row) => `${row.age} yrs / ${row.gender}`,
      Cell: ({ value }) => (
        <div className="text-sm text-gray-700">{value}</div>
      ),
    },
    {
      header: 'Token Number',
      accessor: 'tokenNumber',
      Cell: ({ value }) => (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <span className="px-2 py-1 bg-gray-100 rounded-md">{value}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      Cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewProfile(row.original.id)}
            className="p-2 text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 rounded-lg transition-colors"
            title="View Profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleViewRecords(row.original.id)}
            className="p-2 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 rounded-lg transition-colors"
            title="View Records"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DynamicTable
          columns={columns}
          data={filteredPatients}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search patients by name, ID, phone, or Aadhar..."
          tabActions={tabActions}
          itemsPerPage={10}
          className="border-0"
          noDataMessage={
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium text-gray-600">No patients found</p>
              <p className="mt-2">Try adjusting your search or add a new patient</p>
              <button
                onClick={handleRegisterNewPatient}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--accent-color)] text-white rounded-lg hover:shadow-md transition-all"
              >
                Add New Patient
              </button>
            </div>
          }
        />
      </div>
    </div>
  );
}