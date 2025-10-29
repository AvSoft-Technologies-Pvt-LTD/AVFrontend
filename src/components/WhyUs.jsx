import React, { useRef, useEffect, useState } from "react";
import { FaShieldAlt, FaUserMd, FaRobot, FaCapsules } from "react-icons/fa";
import { MdHowToReg, MdAssignment, MdDateRange, MdHeadsetMic } from "react-icons/md";
import whyChoose1 from "../assets/99e672c7-f9a2-4070-b3f5-3a49174776bc-removebg-preview.png";
import whyChoose2 from "../assets/team-removebg-preview.png";

const IconWrapper = ({ children }) => (
  <div className="w-10 h-10 md:w-12 md:h-10 flex items-center justify-center rounded-md bg-gradient-to-b from-[var(--accent-color)] to-[var(--accent-color)]/40 shadow-md text-lg md:text-xl">{children}</div>
);
const IconWrapper1 = ({ children }) => (
  <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-gradient-to-b from-[var(--accent-color)] to-[var(--accent-color)]/40 shadow-md text-base md:text-lg">{children}</div>
);

const features = [
  { icon: <FaShieldAlt />, title: "Secure & Trusted", description: "Your health data is encrypted & protected." },
  { icon: <FaUserMd />, title: "Seamless Access", description: "One platform for hospitals, doctors, labs & pharmacies." },
  { icon: <FaRobot />, title: "AI-Driven Insights", description: "Smart health tracking & AI-based recommendations." },
  { icon: <FaCapsules />, title: "Exclusive Benefits", description: "Enjoy discounts on medicines & healthcare services." },
];
const steps = [
  { icon: <MdHowToReg />, title: "Register & Connect", description: "Sign up & link to hospitals, doctors & pharmacies." },
  { icon: <MdAssignment />, title: "Manage Health Records", description: "Store your medical history securely." },
  { icon: <MdDateRange />, title: "Book & Track Appointments", description: "Schedule consultations, lab tests & medicine orders." },
  { icon: <MdHeadsetMic />, title: "24/7 Assistance", description: "Our support team is always ready to help." },
];

const WhyAndHowSection = () => {
  const headingRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [stepsInView, setStepsInView] = useState(Array(steps.length).fill(false));
  const stepRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setInView(true), { threshold: 0.6 });
    headingRef.current && observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observers = stepRefs.current.map((ref, idx) =>
      ref ? new IntersectionObserver(([entry]) => entry.isIntersecting && setStepsInView(prev => { const updated = [...prev]; updated[idx] = true; return updated; }), { threshold: 0.4 }) : null
    );
    stepRefs.current.forEach((ref, idx) => ref && observers[idx] && observers[idx].observe(ref));
    return () => observers.forEach((observer, idx) => observer && stepRefs.current[idx] && observer.disconnect());
  }, []);

  return (
    <section className="bg-[#f5f5f5] py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-5">
        <div className="text-center mb-6 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2" style={{ color: "var(--primary-color)" }}>Why & How</h2>
          <h1 className="text-2xl md:text-3xl font-semibold mt-1 overflow-hidden" style={{ color: "var(--primary-color)" }}>
            <span ref={headingRef} className={`inline-block text-[var(--accent-color)] transition-all duration-700 ease-out ${inView ? "heading-fade-up-inview" : "heading-opacity-0"}`}>DigiHealth Works?</span>
          </h1>
          <p className="text-sm md:text-base text-[var(--primary-color)]/70 max-w-xl md:max-w-2xl mx-auto mt-3">DigiHealth is your one-stop digital healthcare solution, ensuring seamless access to doctors, hospitals, pharmacies, and labs with AI-driven insights and exclusive benefits.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-8 md:mb-14">
          <div className="w-full md:w-1/2">
            <h3 className="text-lg md:text-xl font-semibold mb-4 text-left" style={{ color: "var(--primary-color)" }}>Why Choose DigiHealth?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {features.map(({ icon, title, description }, i) => (
                <div key={i} className="flex items-start p-3 md:p-4 bg-white rounded-lg shadow-sm transition-transform duration-300 hover:scale-[1.02]">
                  <IconWrapper>{icon}</IconWrapper>
                  <div className="ml-2.5 md:ml-3">
                    <h4 className="text-sm md:text-base font-semibold mb-1">{title}</h4>
                    <p className="text-xs text-[var(--primary-color)]/70">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 relative">
            <div className="absolute top-3 md:top-4 right-3 md:right-6 bg-[var(--accent-color)] opacity-30 rounded-full w-16 md:w-28 h-16 md:h-28"></div>
            <img src={whyChoose1} alt="Healthcare Professional" className="w-full max-w-[280px] md:max-w-[350px] mx-auto" />
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="w-full md:w-1/2 relative order-2 md:order-1">
            <div className="absolute top-[-12px] md:top-[-80px] left-[-20px] md:left-[-30px] bg-[var(--accent-color)]/60 opacity-60 w-20 md:w-40 h-20 md:h-40 rounded-full"></div>
            <div className="absolute top-1/2 right-[-5px] md:right-[-10px] bg-[var(--accent-color)]/60 w-10 md:w-16 h-10 md:h-16 rotate-45 rounded-full"></div>
            <div className="absolute bottom-[-60px] left-[-20px] md:left-[-40px] bg-[var(--accent-color)]/60 opacity-60 w-20 md:w-32 h-20 md:h-32 rounded-lg"></div>
            <img src={whyChoose2} alt="Healthcare Process" className="w-full max-w-xs md:max-w-md mx-auto rounded-lg" />
          </div>
          <div className="w-full md:w-1/2 order-1 md:order-2">
            <h3 className="text-lg md:text-2xl font-semibold mb-6 text-left blink-heading" style={{ color: "var(--primary-color)" }}>
              {Array.from("How We Work?").map((char, index) => <span key={index}>{char === " " ? "\u00A0" : char}</span>)}
            </h3>
            <div className="relative mt-4 md:mt-6">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 md:w-1 h-full bg-[var(--accent-color)] rounded-lg"></div>
              {steps.map(({ icon, title, description }, i) => (
                <div key={i} ref={el => stepRefs.current[i] = el} className={`relative mb-4 md:mb-6 ${i % 2 === 0 ? "flex-row-reverse" : ""} flex items-center`}>
                  <div className={`w-full max-w-xs md:max-w-sm p-3 md:p-4 bg-white rounded-lg shadow-md transition-transform duration-300 hover:scale-105 flex items-center gap-3 ${stepsInView[i] ? (i % 2 === 0 ? "custom-slide-in-right" : "custom-slide-in-left") : "custom-opacity-0"}`}>
                    <IconWrapper1>{icon}</IconWrapper1>
                    <div>
                      <h4 className="text-sm md:text-base font-semibold mb-1">{title}</h4>
                      <p className="text-xs md:text-sm text-[var(--primary-color)]/70">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyAndHowSection;
