import { useState } from "react";
import { QrCode, Heart, Pill, Syringe, Phone } from "lucide-react";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";

const AVCard = () => {
  const [formData] = useState({
    name: "XXXXXXXXX",
    mobile: "+91 XXXXXXXXXX",
    dob: "XX/XX/XXXX",
    gender: "XXXXX",
    healthId: "XXXXXX-XXXXX-XXXXX",
    helpline: "1800-123-4567",
    validUpto: "XX/XX/XXXX",
    imageUrl:
      "https://img.freepik.com/vecteurs-premium/icone-profil-avatar-par-defaut-image-utilisateur-medias-sociaux-icone-avatar-gris-silhouette-profil-vide-illustration-vectorielle_561158-3383.jpg",
  });

  const bgIcons = [
    { Icon: Heart, pos: "top-4 right-20" },
    { Icon: Pill, pos: "bottom-12 left-12" },
    { Icon: Syringe, pos: "bottom-20 right-20" },
  ];

  return (
    <motion.div
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
      initial={{ opacity: 0.85, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full max-w-[300px] md:max-w-[320px] h-[200px] md:h-[220px] rounded-2xl overflow-hidden shadow-2xl  text-white mx-auto"
    >
<div className="absolute inset-0 bg-gradient-to-r from-[#007A50] to-[#050912] opacity-90"></div>
      {/* Background icons */}
      <div className="absolute inset-0 overflow-hidden">
        {bgIcons.map(({ Icon, pos }, i) => (
          <motion.div
            key={i}
            className={`absolute ${pos}`}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360, 0],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              delay: i * 0.8,
            }}
          >
            <Icon size={24} className="text-green-200" />
          </motion.div>
        ))}
      </div>

      {/* Card content */}
      <div className="relative h-full p-4 flex flex-col">
        {/* Header: Logo & DigiHealth (right-aligned) */}
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-2">
                  <img src={logo} alt="AV Logo" className="w-12 h-12" />
            <h1 className="text-lg font-extrabold text-[#01D48C]">DigiHealth</h1>
      
          </div>
        </div>

        {/* User Info and QR Code */}
        <div className="flex  items-center flex-grow ">
          <div className="flex items-center gap-3">
            <img
              src={formData.imageUrl}
              alt="User"
              className="w-16 h-16 md:w-18 md:h-18 rounded-full object-cover border-2 border-white"
            />
            <div className="text-sm">
              <p className="font-semibold">Name: {formData.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-gray-300">DOB: {formData.dob} |</span>
                <span className="text-xs text-gray-300">Gender: {formData.gender}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Health ID, Valid Upto, and QR Code */}
        <div className="flex justify-between items-end mt-2 text-gray-300">
          <div className="text-sm">
            Health ID: 
            <div className="font-semibold text-base">{formData.healthId}</div>
            <div className="text-xs mt-1">Valid Upto: {formData.validUpto}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 md:w-12 md:h-12 bg-white p-1 rounded">
              <QrCode size={40} className="text-[#01D48C]" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AVCard;