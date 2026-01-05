import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

export default function ScrollIndicator() {
  const [scrollY, setScrollY] = useState(0);
  const y = useMotionValue(0);

  // Track scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      y.set(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [y]);

  // Fade out as you scroll past 200px
  const opacity = useTransform(y, [0, 200], [1, 0]);

  return (
    <motion.div
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      animate={{ y: [0, 10, 0] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      style={{ opacity }}
    >
      {/* Down-pointing triangle */}
      <div className="w-6 h-6 border-l-0 border-r-4 border-b-4 border-purple-500 transform rotate-45"></div>
    </motion.div>
  );
}
