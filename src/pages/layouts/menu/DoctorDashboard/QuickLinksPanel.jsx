// File: DrForm/QuickLinksPanel.jsx
import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, X, Grid3X3 } from "lucide-react";
import { BadgeCheck, Stethoscope, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * QuickLinksPanel
 *
 * Default behavior (by request):
 *   top: 10px;
 *   height: calc(100vh - 60px);  // user requested "calc(-60px + 100vh)"
 *   z-index: 200;
 *
 * Props:
 * - isOpen (optional): boolean (controlled)
 * - onToggle(open): fn
 * - setActiveForm: fn
 * - patient: object
 * - showTrigger: boolean (default true)
 * - usePortal: boolean (default true)
 * - autoPosition: boolean (default false) -> if true, compute top from sticky headers (old behavior)
 * - fixedTopPx: number (default 10) -> used when autoPosition === false
 * - fixedHeightCalc: string (default 'calc(100vh - 60px)') -> used when autoPosition === false
 * - nudgeUpPx: number used only by autoPosition mode (keeps backward compatibility)
 * - zIndexPanel, zIndexBackdrop
 */
const QuickLinksPanel = ({
  isOpen: propIsOpen,
  onToggle,
  setActiveForm,
  patient: propPatient,
  showTrigger = true,
  usePortal = true,
  autoPosition = false, // default: use fixed top/height as requested
  fixedTopPx = 10,
  fixedHeightCalc = "calc(100vh - 60px)",
  offsetTopRem = 5.5,
  nudgeUpPx = 28, // only used if autoPosition=true
 zIndexPanel = 10000,
zIndexBackdrop = 9999,

}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const patient =
    location.state?.patient ||
    propPatient || {
      name: "Unknown Patient",
      email: "unknown@example.com",
      phone: "N/A",
      age: "N/A",
      gender: "N/A",
      diagnosis: "N/A",
      type: "IPD",
    };

  const isIPDPatient = (patient?.type || "").toLowerCase() === "ipd";

  // controlled/uncontrolled
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof propIsOpen !== "undefined";
  const isOpen = isControlled ? propIsOpen : internalOpen;

  // only used in autoPosition mode
  const [panelTopPxAuto, setPanelTopPxAuto] = useState(null);

  const computeHeaderBottomPx = useCallback(() => {
    try {
      const all = Array.from(document.querySelectorAll("*"));
      const sticky = all.filter((el) => {
        try {
          return getComputedStyle(el).position === "sticky";
        } catch {
          return false;
        }
      });
      if (!sticky.length) return null;

      const pinned = sticky.filter((el) => {
        try {
          const r = el.getBoundingClientRect();
          return r.top <= 1;
        } catch {
          return false;
        }
      });
      if (!pinned.length) return null;

      const bottoms = pinned.map((el) => el.getBoundingClientRect().bottom);
      const maxBottom = Math.max(...bottoms);
      return Math.round(maxBottom + window.scrollY);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!autoPosition) return;

    const update = () => {
      const headerBottom = computeHeaderBottomPx();
      if (headerBottom && headerBottom > 0) {
        const adjusted = Math.max(headerBottom - Number(nudgeUpPx || 0), 0);
        setPanelTopPxAuto(adjusted);
      } else {
        setPanelTopPxAuto(null);
      }
    };

    update();
    const onResize = () => window.requestAnimationFrame(update);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
    };
  }, [autoPosition, computeHeaderBottomPx, nudgeUpPx]);

  useEffect(() => {
    if (isControlled && onToggle) onToggle(propIsOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPanel = () => {
    if (!isControlled) setInternalOpen(true);
    if (onToggle) onToggle(true);
  };
  const closePanel = () => {
    if (!isControlled) setInternalOpen(false);
    if (onToggle) onToggle(false);
  };

  const links = [
    ...(isIPDPatient
      ? [
          {
            name: "Gate Pass",
            icon: BadgeCheck,
            color: "text-green-600",
            bgColor: "bg-green-50",
            hoverBgColor: "hover:bg-green-100",
          },
        ]
      : []),
    {
      name: "Nursing & Treatment",
      icon: Stethoscope,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverBgColor: "hover:bg-blue-100",
    },
    ...(isIPDPatient
      ? [
          {
            name: "Discharge",
            icon: LogOut,
            color: "text-red-600",
            bgColor: "bg-red-50",
            hoverBgColor: "hover:bg-red-100",
          },
        ]
      : []),
  ];

  const handleLinkClick = (link) => {
    if (setActiveForm) {
      const key = link.name.toLowerCase().split(" ")[0] || link.name.toLowerCase();
      setActiveForm(key);
    }

    if (link.name === "Nursing & Treatment") {
      navigate("Nursing-and-treatment", { state: { patient } });
      return closePanel();
    }
    if (link.name === "Gate Pass") {
      navigate("/doctordashboard/form/Gate-pass", { state: { patient } });
      return closePanel();
    }
    if (link.name === "Discharge") {
      navigate("/doctordashboard/form/Discharge-modal", { state: { patient } });
      return closePanel();
    }
    closePanel();
  };

  // PANEL STYLES
  // If autoPosition is enabled and we computed a value, use that;
  // otherwise use the fixed top/height requested by the user.
  const panelStyle = (() => {
    if (autoPosition && panelTopPxAuto) {
      return { top: `${panelTopPxAuto}px`, height: `calc(100vh - ${panelTopPxAuto}px)`, zIndex: zIndexPanel };
    }
    // fixed/default requested values:
   return { top: `${fixedTopPx}px`, height: `calc(100vh - ${fixedTopPx - 10}px)`, zIndex: zIndexPanel };

  })();

  const backdropStyle = { zIndex: zIndexBackdrop };

  const PanelUI = (
    <>
      {showTrigger && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openPanel();
          }}
          style={{ zIndex: zIndexPanel + 1, position: "relative", pointerEvents: "auto" }}
          className="flex items-center gap-2 px-3 py-2 bg-white text-[var(--primary-color)] rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105 border border-gray-200"
          aria-expanded={isOpen}
          aria-controls="quick-links-panel"
        >
          <Grid3X3 className="w-4 h-4" />
          <span className="hidden sm:inline">Quick Links</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            style={backdropStyle}
            onClick={closePanel}
            aria-hidden
          />
          <aside
            id="quick-links-panel"
            className="fixed right-0 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-200"
            style={panelStyle}
            role="dialog"
            aria-modal="true"
          >
            {/* Sticky panel header so it stays visible while panel content scrolls */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white p-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Quick Access</h3>
                <p className="text-xs opacity-90">Patient Services</p>
              </div>
              <button
                onClick={closePanel}
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
                aria-label="Close quick links"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {links.map((link, index) => (
                  <button
                    key={`${link.name}-${index}`}
                    onClick={() => handleLinkClick(link)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 text-left group bg-white border-gray-200 ${link.hoverBgColor} hover:border-gray-300 hover:shadow-sm`}
                  >
                    <div className={`p-1.5 rounded-md ${link.bgColor}`}>
                      <link.icon className={`w-4 h-4 ${link.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-800">{link.name}</span>
                      <p className="text-xs mt-0.5 text-gray-500">
                        {link.name === "Gate Pass"
                          ? "Generate visitor passes"
                          : link.name === "Nursing & Treatment"
                          ? "View treatment details"
                          : link.name === "Discharge"
                          ? "Process discharge"
                          : "Open"}
                      </p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>

             
            </div>
          </aside>
        </>
      )}
    </>
  );

  return usePortal && typeof document !== "undefined" ? createPortal(PanelUI, document.body) : PanelUI;
};

export default QuickLinksPanel;
