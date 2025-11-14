import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Heart, Mail, Phone, Facebook, Twitter, Linkedin, ChevronDown, ChevronUp } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if current path is the default path (home page)
  const isDefaultPath = location.pathname === '/';
  
  // Footer is always expanded on default path, otherwise controlled by state
  const shouldShowExpanded = isDefaultPath || isExpanded;

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
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white mt-auto border-t border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-1.5 rounded-lg">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              PocketClinic
            </span>
            <span className="text-xs text-emerald-400 font-medium">Your Health, Our Priority.</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors">
              <Mail className="w-4 h-4 text-emerald-500" />
              <a href="mailto:contact@pocketclinic.com">contact@pocketclinic.com</a>
            </div>
            <div className="hidden md:block text-slate-600">|</div>
            <div className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors">
              <Phone className="w-4 h-4 text-emerald-500" />
              <a href="tel:+1234567890">+1 (234) 567-890</a>
            </div>
            <div className="hidden md:block text-slate-600">|</div>
            <div className="flex items-center gap-3">
              <a
                href="#facebook"
                className="p-1.5 rounded-full bg-slate-700/50 hover:bg-emerald-600 transition-all duration-200 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#twitter"
                className="p-1.5 rounded-full bg-slate-700/50 hover:bg-emerald-600 transition-all duration-200 hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#linkedin"
                className="p-1.5 rounded-full bg-slate-700/50 hover:bg-emerald-600 transition-all duration-200 hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
            <div className="hidden md:block text-slate-600">|</div>
            {!isDefaultPath && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium text-sm"
              >
                {isExpanded ? 'Less' : 'More'}
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            shouldShowExpanded ? 'max-h-[1000px] opacity-100 mt-8' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-slate-700 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold mb-4 text-emerald-400">About PocketClinic</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Leading digital healthcare platform providing teleconsultation services,
                  online pharmacy, lab tests, and comprehensive health management solutions.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-emerald-400">Quick Links</h3>
                <ul className="space-y-2">
                  {footerSections.quickLinks.map((link) => (
                    <li key={link}>
                      <a
                        href={`#${link.toLowerCase()}`}
                        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-emerald-400">User Services</h3>
                <ul className="space-y-2">
                  {footerSections.userServices.map((service) => (
                    <li key={service}>
                      <a
                        href={`#${service.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        {service}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-emerald-400">Support</h3>
                <ul className="space-y-2">
                  {footerSections.support.map((item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-emerald-400">Legal</h3>
                <ul className="space-y-2">
                  {footerSections.legal.map((item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
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

        <div className="border-t border-slate-700 mt-8 pt-6 text-center">
          <p className="text-sm text-slate-400">
            © 2025 PocketClinic. All rights reserved. HealthConnect @Testing.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
