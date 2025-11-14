// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { IoCallOutline, IoMenu, IoClose } from "react-icons/io5";
// import { RiHospitalLine, RiBankCardLine, RiBriefcaseLine, RiShieldCheckLine, RiCapsuleFill, RiStethoscopeFill, RiFlaskLine, RiArrowDropDownFill } from "react-icons/ri";

// const Navbar = () => {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const navigate = useNavigate();
//   const services = [
//     { label: 'Healthcard', icon: <RiBankCardLine /> },
//     { label: 'Consultation', icon: <RiStethoscopeFill /> },
//     { label: 'Pharmacy', icon: <RiCapsuleFill /> },
//     { label: 'Insurance', icon: <RiShieldCheckLine /> },
//     { label: 'Emergency', icon: <IoCallOutline /> }
//   ];
//   return (
//     <nav className="bg-white/10 backdrop-blur-xl px-4 py-2 flex justify-between items-center sticky top-0 text-lg shadow-lg z-50 transition-all duration-300">
//       <div className="flex items-center text-3xl"><h1 className="h2-heading ml-2">Di<span className="text-[var(--accent-color)]">gi</span>Health</h1></div>
//       <div className="hidden md:flex gap-3">
//         <button onClick={() => navigate('/login')} className="group relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-semibold text-[var(--accent-color)] bg-white border border-[var(--accent-color)] rounded-full shadow-md transition duration-300 ease-in-out hover:shadow-lg">
//           <span className="absolute top-0 left-0 w-0 h-[2px] bg-[var(--accent-color)] transition-all duration-300 ease-in-out group-hover:w-full"></span>
//           <span className="absolute bottom-0 right-0 w-0 h-[2px] bg-[var(--accent-color)] transition-all duration-300 ease-in-out group-hover:w-full"></span>
//           <span className="absolute inset-0 bg-[var(--accent-color)] opacity-0 transform scale-0 group-hover:scale-120 group-hover:opacity-100 transition-all duration-500 ease-out origin-center rotate-6"></span>
//           <span className="absolute inset-0 rounded-full border border-transparent group-hover:border-[var(--accent-color)] group-hover:shadow-[0_0_15px_var(--accent-color)] transition-all duration-300 ease-in-out"></span>
//           <span className="relative z-10 transition-colors duration-300 ease-in-out group-hover:text-white">Login</span>
//         </button>
//         <button className="btn btn-primary relative overflow-hidden group" onClick={() => navigate('/register')}>
//           <span className="absolute inset-0 bg-[var(--accent-color)] z-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
//           <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Register</span>
//         </button>
//       </div>
//       <div className="md:hidden"><button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-2xl">{mobileMenuOpen ? <IoClose /> : <IoMenu />}</button></div>
//       {mobileMenuOpen && (
//         <div className="md:hidden absolute top-16 left-0 right-0 bg-white/90 backdrop-blur-xl shadow-lg py-4 px-6 rounded-b-xl z-40">
//           <div className="mb-4">
//             <h3 className="text-lg font-semibold mb-2 text-[var(--primary-color)]">Services</h3>
//             <ul className="flex flex-col gap-2">{services.map(({ label, icon }) => <li key={label} className="flex items-center gap-3 px-4 py-2 text-[var(--primary-color)] hover:bg-[var(--accent-color)] hover:text-white rounded-lg transition-all duration-150 cursor-pointer">{icon} {label}</li>)}</ul>
//           </div>
//           <div className="flex flex-col gap-3 mt-4">
//             <button onClick={() => navigate('/login')} className="group relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-semibold text-[var(--accent-color)] bg-white border border-[var(--accent-color)] rounded-full shadow-md transition duration-300 ease-in-out hover:shadow-lg">
//               <span className="relative z-10 transition-colors duration-300 ease-in-out group-hover:text-white">Login</span>
//             </button>
//             <button className="btn btn-primary relative overflow-hidden group" onClick={() => navigate('/register')}>
//               <span className="absolute inset-0 bg-[var(--accent-color)] z-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
//               <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Register</span>
//             </button>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };
// export default Navbar;

import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if current path is the default path (home page)
  const isDefaultPath = location.pathname === '/';

  const navLinks = ['Healthcard', 'Services', 'Doctors', 'Labs', 'Hospitals', 'Blog', 'Contact'];

  return (
    <header className="bg-white/10 backdrop-blur-xl flex justify-between items-center sticky top-0 text-lg shadow-lg z-50 transition-all duration-300">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl">
                <Heart className="w-7 h-7 text-white fill-white" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent tracking-tight">
                PocketClinic
              </span>
              <p className="text-xs text-[var(--primary-color)] font-medium leading-none">Healthcare Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="relative px-4 py-2  font-semibold text-[var(--primary-color)] hover:text-[var(--accent-color)] transition-all duration-200 group overflow-hidden rounded-lg"
              >
                <span className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-all duration-200"></span>
                <span className="relative">{link}</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-300 group-hover:w-4 transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          {isDefaultPath && (
          <div className="hidden md:flex items-center space-x-3">
            <button onClick={() => navigate('/login')} className="group relative inline-flex items-center justify-center px-6 py-1 overflow-hidden font-semibold text-[var(--accent-color)] bg-white border border-[var(--accent-color)] rounded-full shadow-md transition duration-300 ease-in-out hover:shadow-lg">
               <span className="relative z-10 transition-colors duration-300 ease-in-out group-hover:text-[var(--primary-color)]">Login</span>
             </button>
             <button className="btn btn-primary relative overflow-hidden group" onClick={() => navigate('/register')}>
               <span className="absolute inset-0 bg-[var(--accent-color)] z-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
               <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Register</span>
             </button>
          </div>
        )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-emerald-400" />
            ) : (
              <Menu className="w-6 h-6 text-emerald-400" />
            )}
          </button>
        </div>

       {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/90 backdrop-blur-xl shadow-lg py-4 px-6 rounded-b-xl z-40">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-[var(--primary-color)]">Navigation</h3>
            <ul className="flex flex-col gap-2">{navLinks.map((link) => <li key={link} className="flex items-center gap-3 px-4 py-2 text-[var(--primary-color)] hover:bg-[var(--accent-color)] hover:text-white rounded-lg transition-all duration-150 cursor-pointer">{link}</li>)}</ul>
          </div>
          {isDefaultPath && (
          <div className="flex flex-col gap-3 mt-4">
            <button onClick={() => navigate('/login')} className="group relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-semibold text-[var(--accent-color)] bg-white border border-[var(--accent-color)] rounded-full shadow-md transition duration-300 ease-in-out hover:shadow-lg">
              <span className="relative z-10 transition-colors duration-300 ease-in-out group-hover:text-white">Login</span>
            </button>
            <button className="btn btn-primary relative overflow-hidden group" onClick={() => navigate('/register')}>
              <span className="absolute inset-0 bg-[var(--accent-color)] z-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Register</span>
            </button>
          </div>
          )}
        </div>
      )}
      </div>
    </header>
  );
};

export default Header;
