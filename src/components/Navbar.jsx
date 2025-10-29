import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCallOutline, IoMenu, IoClose } from "react-icons/io5";
import { RiHospitalLine, RiBankCardLine, RiBriefcaseLine, RiShieldCheckLine, RiCapsuleFill, RiStethoscopeFill, RiFlaskLine, RiArrowDropDownFill } from "react-icons/ri";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const services = [
    { label: 'Healthcard', icon: <RiBankCardLine /> },
    { label: 'Consultation', icon: <RiStethoscopeFill /> },
    { label: 'Pharmacy', icon: <RiCapsuleFill /> },
    { label: 'Insurance', icon: <RiShieldCheckLine /> },
    { label: 'Emergency', icon: <IoCallOutline /> }
  ];
  return (
    <nav className="bg-white/10 backdrop-blur-xl px-4 py-2 flex justify-between items-center sticky top-0 text-lg shadow-lg z-50 transition-all duration-300">
      <div className="flex items-center text-3xl"><h1 className="h2-heading ml-2">Di<span className="text-[var(--accent-color)]">gi</span>Health</h1></div>
      <div className="hidden md:flex gap-3">
        <button onClick={() => navigate('/login')} className="group relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-semibold text-[var(--accent-color)] bg-white border border-[var(--accent-color)] rounded-full shadow-md transition duration-300 ease-in-out hover:shadow-lg">
          <span className="absolute top-0 left-0 w-0 h-[2px] bg-[var(--accent-color)] transition-all duration-300 ease-in-out group-hover:w-full"></span>
          <span className="absolute bottom-0 right-0 w-0 h-[2px] bg-[var(--accent-color)] transition-all duration-300 ease-in-out group-hover:w-full"></span>
          <span className="absolute inset-0 bg-[var(--accent-color)] opacity-0 transform scale-0 group-hover:scale-120 group-hover:opacity-100 transition-all duration-500 ease-out origin-center rotate-6"></span>
          <span className="absolute inset-0 rounded-full border border-transparent group-hover:border-[var(--accent-color)] group-hover:shadow-[0_0_15px_var(--accent-color)] transition-all duration-300 ease-in-out"></span>
          <span className="relative z-10 transition-colors duration-300 ease-in-out group-hover:text-white">Login</span>
        </button>
        <button className="btn btn-primary relative overflow-hidden group" onClick={() => navigate('/register')}>
          <span className="absolute inset-0 bg-[var(--accent-color)] z-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Register</span>
        </button>
      </div>
      <div className="md:hidden"><button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-2xl">{mobileMenuOpen ? <IoClose /> : <IoMenu />}</button></div>
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/90 backdrop-blur-xl shadow-lg py-4 px-6 rounded-b-xl z-40">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-[var(--primary-color)]">Services</h3>
            <ul className="flex flex-col gap-2">{services.map(({ label, icon }) => <li key={label} className="flex items-center gap-3 px-4 py-2 text-[var(--primary-color)] hover:bg-[var(--accent-color)] hover:text-white rounded-lg transition-all duration-150 cursor-pointer">{icon} {label}</li>)}</ul>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <button onClick={() => navigate('/login')} className="group relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-semibold text-[var(--accent-color)] bg-white border border-[var(--accent-color)] rounded-full shadow-md transition duration-300 ease-in-out hover:shadow-lg">
              <span className="relative z-10 transition-colors duration-300 ease-in-out group-hover:text-white">Login</span>
            </button>
            <button className="btn btn-primary relative overflow-hidden group" onClick={() => navigate('/register')}>
              <span className="absolute inset-0 bg-[var(--accent-color)] z-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Register</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
