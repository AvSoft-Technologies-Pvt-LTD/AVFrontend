import React from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';

const Footer = () => {
  const healthCheckHandle = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get('http://localhost:8080/api/public/healthcheck');
      alert(res.data);
    } catch (err) {
      console.error('Healthcheck failed:', err);
    }
  };

  const sections = [
    {
      title: 'DigiHealth',
      content: (
        <>
          <p className="text-[#F5F5F5]/80 text-xs sm:text-sm">Experience personalized medical care from the comfort of your home.</p>
          <p className="mt-2 text-[var(--accent-color)] text-sm">9144-784-724</p>
          <a href="mailto:info@DigiHealth.com" className="text-[var(--accent-color)] hover:opacity-80 transition-opacity text-sm block">info@DigiHealth.com</a>
        </>
      )
    },
    {
      title: 'Quick Links',
      links: ['home', 'about', 'blog', 'contact'].map(link => {
        let label = link.charAt(0).toUpperCase() + link.slice(1);
        if (link === 'contact') label = 'Contact Us';
        if (link === 'about') label = 'About Us';
        return { href: `/${link}`, label };
      })
    },
    {
      title: 'User Services',
      links: ['healthcard', 'consultation', 'ecommerce', 'doctors', 'hospitals', 'clinics', 'lab-tests', 'pharmacies'].map(link => ({
        href: `/${link}`,
        label: link.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      }))
    },
    {
      title: 'Support',
      links: ['faqs', 'report', 'helpdesk'].map(link => ({
        href: `/${link}`,
        label: link === 'faqs' ? 'FAQs' : link.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      }))
    },
    {
      title: 'Legal',
      links: ['terms', 'privacy', 'cookies', 'trust'].map(link => {
        let label = '';
        switch (link) {
          case 'terms': label = 'Terms & Conditions'; break;
          case 'privacy': label = 'Privacy Policy'; break;
          case 'cookies': label = 'Cookie Preferences'; break;
          case 'trust': label = 'Trust Center'; break;
          default: label = link.charAt(0).toUpperCase() + link.slice(1);
        }
        return { href: `/${link}`, label };
      })
    }
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="bg-[var(--primary-color)] text-[#F5F5F5] px-4 sm:px-6 py-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="mb-6 sm:mb-0"
            >
              <h3 className="font-semibold text-[var(--accent-color)] text-base mb-3">{section.title}</h3>
              {section.content}
              {section.links && (
                <ul className="space-y-2">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a href={link.href} className="hover:text-[var(--accent-color)] transition-colors duration-200 text-xs sm:text-sm block">{link.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
        <div className="border-t border-[#F5F5F5]/10">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex space-x-4 sm:space-x-6 mb-1 sm:mb-0">
              {[
                { icon: FaFacebookF, url: "https://facebook.com" },
                { icon: FaTwitter, url: "https://twitter.com" },
                { icon: FaInstagram, url: "https://instagram.com" },
                { icon: FaLinkedinIn, url: "https://linkedin.com" }
              ].map(({ icon: Icon, url }, i) => (
                <motion.a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F5F5F5] hover:text-[var(--accent-color)]"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={18} className="sm:w-5 sm:h-5" />
                </motion.a>
              ))}
            </div>
            <div className="text-center sm:text-right">
              <span className="text-[var(--accent-color)] font-semibold text-sm">DigiHealth</span>
              <p className="text-[#F5F5F5]/60 text-xs sm:text-sm mt-1">Copyright © 2025, DigiHealth. All rights reserved.</p>
              <div className="mt-1">
                <a href="/healthcheck" onClick={healthCheckHandle} className="text-slate-400 hover:underline text-xs sm:text-sm">HealthCheck @Testing</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
