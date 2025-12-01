import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setUser } from '../context-api/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Dummy credentials for different roles
  const dummyCredentials = {
    lab: { email: "admin@medilab.com", password: "medilab123", role: "lab" },
    frontdesk: { email: "frontdesk@medilab.com", password: "medilab123", role: "frontdesk" },
    nurse: { email: "nurse@medilab.com", password: "medilab123", role: "nurse" },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Check if the entered email matches any dummy role
      let role = null;
      let validCredentials = null;
      if (email === dummyCredentials.lab.email && password === dummyCredentials.lab.password) {
        role = "lab";
        validCredentials = dummyCredentials.lab;
      } else if (email === dummyCredentials.frontdesk.email && password === dummyCredentials.frontdesk.password) {
        role = "frontdesk";
        validCredentials = dummyCredentials.frontdesk;
      } else if (email === dummyCredentials.nurse.email && password === dummyCredentials.nurse.password) {
        role = "nurse";
        validCredentials = dummyCredentials.nurse;
      } else {
        throw new Error("Invalid email or password");
      }

      // Dispatch setUser with all required fields
      dispatch(setUser({
        email,
        userType: role,
        role,
        isAuthenticated: true,
        token: "dummy-token-" + Date.now(), // Simulate a token
        name: role.charAt(0).toUpperCase() + role.slice(1),
        permissions: [],
      }));

      // Redirect based on role
      switch (role) {
        case "lab":
          navigate("/labdashboard");
          break;
        case "frontdesk":
          navigate("/frontdeskdashboard");
          break;
        case "nurse":
          navigate("/nursedashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E1630] via-[#1a2744] to-[#0E1630] flex items-center justify-center p-4">
      {/* Your existing JSX for the login form */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#01D48C]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#01D48C] to-[#00a86b] flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">MediLab Dashboard</h1>
            <p className="text-gray-300">Diagnostic Laboratory Management</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#01D48C] to-[#00a86b] text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-[#01D48C]/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-400 text-center">
              Use email: admin@medilab.com — password: medilab123 (Lab)<br />
              Use email: frontdesk@medilab.com — password: medilab123 (Frontdesk)<br />
              Use email: nurse@medilab.com — password: medilab123 (Nurse)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
