import { useState } from 'react';
import { Calendar, Clock, User, Download } from 'lucide-react';

export default function LoginReport() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [loginRecords, setLoginRecords] = useState([
    {
      id: 1,
      staffName: 'Priya Sharma',
      role: 'FrontDesk Officer',
      loginTime: '08:45 AM',
      logoutTime: '05:30 PM',
      duration: '8h 45m',
      patientsHandled: 28,
      tokensGenerated: 25,
      date: '2025-01-15'
    },
    {
      id: 2,
      staffName: 'Amit Kumar',
      role: 'FrontDesk Officer',
      loginTime: '09:00 AM',
      logoutTime: '06:00 PM',
      duration: '9h 0m',
      patientsHandled: 32,
      tokensGenerated: 30,
      date: '2025-01-15'
    },
    {
      id: 3,
      staffName: 'Rajesh Patel',
      role: 'FrontDesk Supervisor',
      loginTime: '08:30 AM',
      logoutTime: '05:45 PM',
      duration: '9h 15m',
      patientsHandled: 15,
      tokensGenerated: 12,
      date: '2025-01-15'
    },
  ]);

  const filteredRecords = loginRecords.filter(record => record.date === selectedDate);

  const handleExport = () => {
    alert('Exporting login report to Excel...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">Login Report</h1>
          <p className="text-gray-600 mt-1">Staff activity and attendance tracking</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md"
        >
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <label className="font-semibold text-gray-700">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <User className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="text-2xl font-bold text-gray-800">{filteredRecords.length}</h3>
          <p className="text-sm text-gray-600">Staff on Duty</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <Clock className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="text-2xl font-bold text-gray-800">
            {filteredRecords.reduce((acc, r) => acc + parseInt(r.duration.split('h')[0]), 0)}h
          </h3>
          <p className="text-sm text-gray-600">Total Hours</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <User className="w-8 h-8 text-purple-500 mb-3" />
          <h3 className="text-2xl font-bold text-gray-800">
            {filteredRecords.reduce((acc, r) => acc + r.patientsHandled, 0)}
          </h3>
          <p className="text-sm text-gray-600">Patients Handled</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <Clock className="w-8 h-8 text-orange-500 mb-3" />
          <h3 className="text-2xl font-bold text-gray-800">
            {filteredRecords.reduce((acc, r) => acc + r.tokensGenerated, 0)}
          </h3>
          <p className="text-sm text-gray-600">Tokens Generated</p>
        </div>
      </div>

      {/* Login Records Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Staff Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Login Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Logout Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Duration</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Patients</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-semibold text-gray-800">{record.staffName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{record.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{record.loginTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{record.logoutTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {record.duration}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-800">{record.patientsHandled}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-800">{record.tokensGenerated}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No login records for selected date</p>
          </div>
        )}
      </div>
    </div>
  );
}