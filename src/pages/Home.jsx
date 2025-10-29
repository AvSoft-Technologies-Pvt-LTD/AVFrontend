import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Herosection from "../components/Herosection";
import Speciality from "../components/Speciality";
import Calltoaction from "../components/Calltoaction";
import Statusbar from "../components/Statusbar";
import WhyUs from "../components/WhyUs";
import Footer from "../components/Footer";
import CustomCursor from "../components/CustomCursor";

const Home = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const timer = setTimeout(() => setLoading(false), 3000); return () => clearTimeout(timer); }, []);

  return loading ? (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[var(--primary-color)] text-white relative" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] relative animate-rotate-move" style={{ filter: "url('#goo')" }}>
        <div className="dot bg-[var(--accent-color)] animate-dot-1 z-[3]" />
        <div className="dot bg-[var(--color-surface)] animate-dot-2 z-[2]" />
        <div className="dot bg-[#10beae] animate-dot-3 z-[1]" />
      </div>
      <div className="mt-6 sm:mt-10 text-lg sm:text-2xl font-semibold uppercase tracking-wide relative loading-text">
        Loading your health experience...<span className="underline" />
      </div>
      <svg className="hidden"><defs><filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 21 -7" result="goo" /><feBlend in="SourceGraphic" in2="goo" /></filter></defs></svg>
    </div>
  ) : (
    <div className="w-full h-full bg-gray-50 overflow-hidden">
      <CustomCursor /><Navbar /><Herosection /><Calltoaction /><Statusbar /><Speciality /><WhyUs /><Footer />
    </div>
  );
};

export default Home;
