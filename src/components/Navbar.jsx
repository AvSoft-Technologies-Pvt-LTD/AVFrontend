import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const isDefaultPath = location.pathname === '/';

  const navLinks = [
    { label: 'Healthcard', id: 'calltoaction' },
    { label: 'About', id: 'whyus' },
    { label: 'Blog', id: 'blog' },
    { label: 'Contact', id: 'footer' },
  ];

  return (
    <header className="bg-white/10 backdrop-blur-xl flex justify-between items-center sticky top-0 text-lg shadow-lg z-50 transition-all duration-300">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-20">
          <div
            className="flex items-center space-x-3 group cursor-pointer"
            onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div>
              <img 
                src={logo} 
                alt="PocketClinic Logo" 
                className="h-10 w-auto object-contain" 
              />
              <p className="text-xs ml-12 -mt-2 text-[var(--primary-color)] font-medium leading-none">
                Healthcare Platform
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map(({ label, id }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => scrollToSection(id), 100);
                  } else {
                    scrollToSection(id);
                  }
                }}
                className="relative px-4 py-2 font-semibold text-[var(--primary-color)] hover:text-[var(--accent-color)] transition-all duration-200 group overflow-hidden rounded-lg"
              >
                <span className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-all duration-200"></span>
                <span className="relative">{label}</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-300 group-hover:w-4 transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          {isDefaultPath && (
            <div className="hidden lg:flex items-center space-x-3">
              <button
                onClick={() => navigate('/login')}
                className="group relative inline-flex items-center justify-center px-6 py-1 overflow-hidden font-semibold text-[var(--accent-color)] bg-white border border-[var(--accent-color)] rounded-full shadow-md transition duration-300 ease-in-out hover:shadow-lg"
              >
                <span className="relative z-10 transition-colors duration-300 ease-in-out group-hover:text-[var(--primary-color)]">
                  Login
                </span>
              </button>
              <button
                className="btn btn-primary relative overflow-hidden group"
                onClick={() => navigate('/register')}
              >
                <span className="absolute inset-0 bg-[var(--accent-color)] z-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                  Register
                </span>
              </button>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-emerald-400" />
            ) : (
              <Menu className="w-6 h-6 text-emerald-400" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 right-0 bg-white/90 backdrop-blur-xl shadow-lg py-4 px-6 rounded-b-xl z-40">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-[var(--primary-color)]">
                Navigation
              </h3>
              <ul className="flex flex-col gap-2">
                {navLinks.map(({ label, id }) => (
                  <li
                    key={id}
                    onClick={() => {
                      if (location.pathname !== '/') {
                        navigate('/');
                        setTimeout(() => scrollToSection(id), 100);
                      } else {
                        scrollToSection(id);
                      }
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-[var(--primary-color)] hover:bg-[var(--accent-color)] hover:text-white rounded-lg transition-all duration-150 cursor-pointer"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {isDefaultPath && (
              <div className="flex flex-col gap-3 mt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="group relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-semibold text-[var(--accent-color)] bg-white border border-[var(--accent-color)] rounded-full shadow-md transition duration-300 ease-in-out hover:shadow-lg"
                >
                  <span className="relative z-10 transition-colors duration-300 ease-in-out group-hover:text-white">
                    Login
                  </span>
                </button>
                <button
                  className="btn btn-primary relative overflow-hidden group"
                  onClick={() => navigate('/register')}
                >
                  <span className="absolute inset-0 bg-[var(--accent-color)] z-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                    Register
                  </span>
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