import { useState } from 'react';
import { Search, Filter, Calendar, Clock, User, Phone, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AppointmentList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [appointments, setAppointments] = useState([
    { id: 1, patientName: 'Rajesh Kumar', patientId: 'P-1001', phone: '9876543210', doctor: 'Dr. Sharma', time: '10:00 AM', date: '2025-01-15', status: 'pending', department: 'Cardiology' },
    { id: 2, patientName: 'Priya Patel', patientId: 'P-1002', phone: '9876543211', doctor: 'Dr. Mehta', time: '10:30 AM', date: '2025-01-15', status: 'checked-in', department: 'Orthopedics' },
    { id: 3, patientName: 'Amit Desai', patientId: 'P-1003', phone: '9876543212', doctor: 'Dr. Singh', time: '11:00 AM', date: '2025-01-15', status: 'completed', department: 'General Medicine' },
    { id: 4, patientName: 'Sunita Sharma', patientId: 'P-1004', phone: '9876543213', doctor: 'Dr. Gupta', time: '11:30 AM', date: '2025-01-15', status: 'pending', department: 'Pediatrics' },
    { id: 5, patientName: 'Vikram Singh', patientId: 'P-1005', phone: '9876543214', doctor: 'Dr. Verma', time: '12:00 PM', date: '2025-01-15', status: 'checked-in', department: 'ENT' },
  ]);

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.phone.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      'checked-in': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700'
    };
    return styles[status] || styles.pending;
  };

  const handleGenerateToken = (appointment) => {
    navigate('/frontdesk/tokens', { state: { appointment } });
  };

  return (
    <div className="space-y-6">


      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, patient ID, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>
          {/* Status Filter */}
          <div className="flex gap-2">
            {['all', 'pending', 'checked-in', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filterStatus === status
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Patient</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Doctor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-800">{appointment.patientName}</div>
                      <div className="text-sm text-gray-500">{appointment.patientId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4" />
                      {appointment.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-800">{appointment.doctor}</div>
                      <div className="text-sm text-gray-500">{appointment.department}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4" />
                      {appointment.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleGenerateToken(appointment)}
                      className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-color)]/90 transition-colors"
                    >
                      Generate Token
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAppointments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No appointments found</p>
          </div>
        )}
      </div>
    </div>
  );
}