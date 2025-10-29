import { HiArrowRight } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import AVCard from "./microcomponents/AVCard";

const Calltoaction = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const textButtonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5 + i * 0.2,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div
      ref={ref}
      className="flex justify-center items-center bg-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-6xl h-auto rounded-3xl shadow-lg border-2 border-[var(--accent-color)] overflow-hidden">
        <div className="relative bg-[#F5F5F5] p-4 sm:p-6 z-10 rounded-3xl">
          <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-12">
            {/* Left Side: AVCard and Button */}
            <div className="w-full lg:w-1/2 flex flex-col items-center space-y-6 sm:space-y-8">
              <AVCard />
              <div className="flex flex-wrap justify-center w-full">
                <button
                  className="btn btn-primary px-6 py-3 text-sm sm:text-base"
                  onClick={() => navigate("/healthcard")}
                >
                  Generate HealthCard
                </button>
              </div>
            </div>

            {/* Right Side: Text and Buttons */}
            <div className="w-full lg:w-1/2 text-center lg:text-left space-y-4 sm:space-y-6">
              <motion.h2
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--primary-color)] shimmer-text"
              >
                Get expert advice from top doctors anytime,{" "}
                <span className="text-[var(--accent-color)]">anywhere!</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-sm sm:text-base text-[var(--primary-color)]/80 max-w-lg mx-auto lg:mx-0"
              >
                Connect with qualified healthcare professionals and receive
                personalized medical consultation from the comfort of your home.
              </motion.p>

              <div className="w-full max-w-3xl bg-white rounded-full shadow-md border border-gray-200 overflow-hidden mt-4">
                <div className="grid grid-cols-2 md:flex md:flex-row md:flex-nowrap justify-center md:justify-start">
                  {[
                    "Consult With Doctor",
                    "Order Medicines",
                    "Lab/Scans Booking",
                    "My Medical Records",
                  ].map((text, i) => (
                    <motion.button
                      key={i}
                      custom={i}
                      variants={textButtonVariants}
                      initial="hidden"
                      animate={isInView ? "visible" : "hidden"}
                      className={`relative flex-1 flex items-center justify-center font-medium px-3 py-2 sm:px-5 sm:py-3 text-[var(--primary-color)] text-xs sm:text-sm ${i < 3
                          ? i === 0
                            ? "border-b md:border-b-0 md:border-r"
                            : i === 1
                              ? "border-b md:border-b-0 md:border-r"
                              : "md:border-r"
                          : ""
                        } border-gray-300`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="z-20 flex items-center gap-1">
                        {text}
                        <motion.span whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                          <HiArrowRight size={14} className="sm:size-5" />
                        </motion.span>
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calltoaction;
