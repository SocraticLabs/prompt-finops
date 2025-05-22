"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { useClickAway } from "@uidotdev/usehooks";

interface TooltipProps {
  children: ReactNode;
}

interface TooltipTriggerProps {
  children: ReactNode;
  onHover?: () => void;
}

interface TooltipContentProps {
  children: ReactNode;
}

const TooltipProvider = ({ children }: TooltipProps) => {
  return <div>{children}</div>;
};

const Tooltip = ({ children }: TooltipProps) => {
  return <div className="relative inline-block">{children}</div>;
};

const TooltipTrigger = ({ children }: TooltipTriggerProps) => {
  return <div>{children}</div>;
};

const TooltipContent = ({ children }: TooltipContentProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickAway = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      console.log("TOOLTIP HERE");
      setIsVisible(true);
    }
  };

  useEffect(() => {
    console.log("my useeffect");
    document.addEventListener("mousedown", handleClickAway);
    return () => {
      document.removeEventListener("mousedown", handleClickAway);
    };
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      className="relative inline-flex"
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-auto max-w-xs px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg dark:bg-gray-900 dark:text-gray-100"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
