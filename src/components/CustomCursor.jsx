import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const [ringPos, setRingPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [dotPos, setDotPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const requestRef = useRef();
  const mouse = useRef({ x: ringPos.x, y: ringPos.y });

  useEffect(() => {
    // Check if the device is mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return; // Skip animation on mobile

    const animate = () => {
      setRingPos(prev => ({
        x: prev.x + (mouse.current.x - prev.x) * 0.18,
        y: prev.y + (mouse.current.y - prev.y) * 0.18
      }));
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return; // Skip event listeners on mobile

    const move = e => {
      mouse.current = { x: e.clientX, y: e.clientY };
      setDotPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const hide = () => setVisible(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseout", hide);
    window.addEventListener("mouseenter", move);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseout", hide);
      window.removeEventListener("mouseenter", move);
    };
  }, [isMobile]);

  if (isMobile) return null; // Don't render on mobile

  return (
    <>
      <div
        className="fixed w-6 h-6 border-2 border-[var(--primary-color)] rounded-full pointer-events-none z-[9999] transition-opacity duration-200"
        style={{
          left: `${ringPos.x}px`,
          top: `${ringPos.y}px`,
          transform: "translate(-50%, -50%)",
          opacity: visible ? 1 : 0
        }}
      />
      <div
        className="fixed w-2 h-2 bg-[var(--primary-color)] rounded-full pointer-events-none z-[9999]"
        style={{
          left: `${dotPos.x}px`,
          top: `${dotPos.y}px`,
          transform: "translate(-50%, -50%)",
          opacity: visible ? 1 : 0
        }}
      />
    </>
  );
}
