import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Heart, Mail, Phone, Facebook, Twitter, Linkedin,
  ChevronDown, ChevronUp, ArrowUp
} from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Check if current path is the default path (home page)
  const isDefaultPath = location.pathname === '/';

  // Footer is always expanded on default path, otherwise controlled by state
  const shouldShowExpanded = isDefaultPath || isExpanded;

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Tooltip component
  const Tooltip = ({ children, text }) => (
    <div className="relative group inline-block">
      {children}
      <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 
        bg-slate-800 text-white text-xs rounded py-1 px-2 absolute bottom-full left-1/2 
        transform -translate-x-1/2 -translate-y-2 whitespace-nowrap transition-all 
        duration-200 pointer-events-none z-50">
        {text}
        <span className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
          border-l-4 border-r-4 border-t-4 border-t-slate-800 border-l-transparent 
          border-r-transparent"></span>
      </span>
    </div>
  );

  const footerSections = {
    quickLinks: ['Home', 'About', 'Blog', 'Contact'],
    userServices: [
      'Healthcard',
      'Consultation',
      'Ecommerce',
      'Doctors',
      'Hospitals',
      'Clinics',
      'Lab Tests',
      'Pharmacies',
    ],
    support: ['FAQs', 'Report', 'Helpdesk'],
    legal: ['Terms & Conditions', 'Privacy Policy', 'Cookie Preferences', 'Trust Center'],
  };

  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white mt-auto border-t border-emerald-500/20 relative">
      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 
            flex items-center justify-center text-white shadow-lg transition-all duration-300 
            hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Top Section - Logo and Contact Info */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:gap-6">
          {/* Logo Section */}
          <div className="flex items-center justify-center lg:justify-start space-x-3 group cursor-pointer">
            <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-1.5 rounded-lg">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="text-center lg:text-left">
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                PocketClinic
              </span>
              <p className="text-xs text-emerald-400 font-medium">Your Health, Our Priority.</p>
            </div>
          </div>

          {/* Contact and Social Section */}
          <div className="flex flex-col items-center space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-6">
            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6">
              <div className="flex items-center space-x-2 text-slate-300 hover:text-emerald-400 transition-colors">
                <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <a href="mailto:contact@pocketclinic.com" className="text-sm break-all">contact@pocketclinic.com</a>
              </div>
              <div className="flex items-center space-x-2 text-slate-300 hover:text-emerald-400 transition-colors">
                <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-sm">+1 (234) 567-890</a>
              </div>
            </div>

            {/* Social Media with Tooltips */}
            <div className="flex items-center space-x-3 lg:space-x-2">
              <div className="flex space-x-2">
                <Tooltip text="Facebook">
                  <a
                    href="#facebook"
                    className="p-2 rounded-full "
                    aria-label="Facebook"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                </Tooltip>
                <Tooltip text="Twitter">
                  <a
                    href="#twitter"
                    className="p-2 rounded-full "
                    aria-label="Twitter"
                  >
                    <Twitter className="w-6 h-6" />
                  </a>
                </Tooltip>
                <Tooltip text="LinkedIn">
                  <a
                    href="#linkedin"
                    className="p-2 rounded-full "
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-6 h-6" />
                  </a>
                </Tooltip>
              </div>
            </div>

            {/* Expand/Collapse Button */}
            {!isDefaultPath && (
              <div className="flex items-center">
                <div className="hidden lg:block text-slate-600">|</div>
                <Tooltip text={isExpanded ? "Collapse" : "Expand"}>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300
          transition-colors font-medium text-sm px-3 py-1 rounded-md hover:bg-emerald-500/10"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
        {/* Expandable Content */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${shouldShowExpanded ? 'max-h-[2000px] opacity-100 mt-6 sm:mt-8' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="border-t border-slate-700 pt-6 sm:pt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
              {/* About Section */}
              <div className="sm:col-span-2 lg:col-span-1">
                <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-emerald-400">About PocketClinic</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Leading digital healthcare platform providing teleconsultation services,
                  online pharmacy, lab tests, and comprehensive health management solutions.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-emerald-400">Quick Links</h3>
                <ul className="space-y-2">
                  {footerSections.quickLinks.map((link) => (
                    <li key={link}>
                      <a
                        href={`#${link.toLowerCase()}`}
                        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors block py-1"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* User Services */}
              <div>
                <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-emerald-400">User Services</h3>
                <ul className="space-y-2">
                  {footerSections.userServices.map((service) => (
                    <li key={service}>
                      <a
                        href={`#${service.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors block py-1"
                      >
                        {service}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-emerald-400">Support</h3>
                <ul className="space-y-2">
                  {footerSections.support.map((item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors block py-1"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-emerald-400">Legal</h3>
                <ul className="space-y-2">
                  {footerSections.legal.map((item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors block py-1"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-slate-700 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
          <p className="text-xs sm:text-sm text-slate-400">
            2025 PocketClinic. All rights reserved. HealthConnect @Testing.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
