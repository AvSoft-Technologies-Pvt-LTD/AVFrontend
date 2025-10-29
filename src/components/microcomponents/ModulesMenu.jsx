// File: ModulesMenu.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaTh,
  FaUserShield,
  FaDesktop,
  FaListOl,
  FaBed,
  FaUserClock,
} from "react-icons/fa";

const modules = [
  { name: "Frontdesk", icon: FaDesktop, labelLines: ["Frontdesk"] },
  { name: "Admin", icon: FaUserShield, labelLines: ["Admin"] },
  { name: "NewToken", icon: FaUserClock, labelLines: ["New", "Token"] },
  { name: "DisplayToken", icon: FaListOl, labelLines: ["Display", "Token"] },
  { name: "QueueStatus", icon: FaUsers, labelLines: ["Queue", "Status"] },
  { name: "BedManagement", icon: FaBed, labelLines: ["Bed", "Manage"] },
];

export default function ModulesMenu({ user, onModuleSelect }) {
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null); // trigger bounding rect (page coords)
  const [menuLeft, setMenuLeft] = useState(null); // computed left for menu (page coords)
  const [menuTop, setMenuTop] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const basePath =
    user?.userType?.toLowerCase() === "doctor"
      ? "/doctordashboard"
      : user?.userType?.toLowerCase() === "hospital"
      ? "/hospitaldashboard"
      : "";

  const routes = {
    Admin: "/dr-admin",
    DisplayToken: "/tokendisplay",
    NewToken: "/queuetoken",
    Pharmacy: "/pharmacymodule",
    Laboratory: "/labmodule",
    Frontdesk: "/frontdesk",
    QueueStatus: "/queuemanagement",
    BedManagement: "/bedroommanagement",
    Reports: "/reports",
  };

  const handleClick = (name) => {
    navigate(`${basePath}${routes[name] || ""}`);
    setOpen(false);
    if (onModuleSelect) onModuleSelect();
  };

  const updateAnchorRect = useCallback(() => {
    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setAnchorRect({
        top: r.bottom + window.scrollY,
        left: r.left + window.scrollX,
        right: r.right + window.scrollX,
        width: r.width,
        height: r.height,
      });
    }
  }, []);

  useEffect(() => {
    if (open) {
      updateAnchorRect();
      // allow the portal to mount then measure menu
      requestAnimationFrame(() => {
        if (menuRef.current && anchorRect) {
          const menuRect = menuRef.current.getBoundingClientRect();
          // compute left so the menu's right edge lines up with the button's right edge (open to left)
          let desiredLeft = anchorRect.right - menuRect.width;
          // keep menu visible within viewport horizontally:
          const minLeft = 8 + window.scrollX;
          const maxLeft = window.innerWidth - menuRect.width - 8 + window.scrollX;
          if (desiredLeft < minLeft) desiredLeft = minLeft;
          if (desiredLeft > maxLeft) desiredLeft = maxLeft;
          setMenuLeft(desiredLeft);
          setMenuTop(anchorRect.top + 8); // small offset below button
        }
      });
    } else {
      setMenuLeft(null);
      setMenuTop(null);
    }
  }, [open, anchorRect, updateAnchorRect]);

  // close on outside clicks / escape; reposition on resize/scroll
  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (buttonRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onWindowChange = () => {
      if (!open) return;
      updateAnchorRect();
    };

    window.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onEsc);
    window.addEventListener("resize", onWindowChange);
    window.addEventListener("scroll", onWindowChange, true);
    return () => {
      window.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onEsc);
      window.removeEventListener("resize", onWindowChange);
      window.removeEventListener("scroll", onWindowChange, true);
    };
  }, [open, updateAnchorRect]);

  // portal dropdown content
  const dropdown = (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        top: menuTop ?? (anchorRect ? anchorRect.top + 8 : 0),
        left: menuLeft ?? (anchorRect ? anchorRect.left : 0),
        zIndex: 2147483646,
        minWidth: 240,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div className="bg-white rounded-xl shadow-xl p-4" style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
        <div className="grid grid-cols-3 gap-1 xl:flex xl:flex-row xl:gap-1 items-start">
          {modules.map(({ name, icon: Icon, labelLines }) => (
            <button
              key={name}
              onClick={() => handleClick(name)}
              className="flex flex-col items-center justify-start p-2 rounded-lg hover:bg-gray-50"
              title={labelLines.join(" ")}
              type="button"
            >
              <div
                className="w-14 h-14 flex items-center justify-center rounded-full
                      bg-gradient-to-br from-[#1CA4AC]/20 to-[#68C723]/20 text-[var(--primary-color)]
                      group-hover:from-[#1CA4AC] group-hover:to-[#68C723] group-hover:text-white
                      shadow-sm group-hover:scale-105 transition duration-300"
              >
                <Icon className="block h-7 w-7" />
              </div>

              <span className="mt-1 text-base font-medium text-[var(--primary-color)] text-center leading-tight whitespace-pre-line group-hover:text-[var(--accent-color)]">
                {labelLines.join("\n")}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative overflow-visible inline-block">
        <button
          ref={buttonRef}
          onClick={() => {
            setOpen((o) => !o);
            updateAnchorRect();
            // allow updateAnchorRect to set anchorRect before measuring menu
            setTimeout(() => updateAnchorRect(), 0);
          }}
          className="flex flex-row items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
          type="button"
        >
          <div className="w-12 h-12 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
            <FaTh className="h-6 w-6 text-white" />
          </div>
        </button>
      </div>

      {open && createPortal(dropdown, document.body)}
    </>
  );
}
