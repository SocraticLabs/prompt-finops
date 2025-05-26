"use client";

import React, { ReactNode, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  children: ReactNode;
}

interface TooltipTriggerProps {
  children: ReactNode;
  setIsVisible: React.Dispatch<SetStateAction<boolean>>;
}

interface TooltipContentProps {
  children: ReactNode;
  isVisible: boolean;
}

const TooltipProvider = ({ children }: TooltipProps) => {
  return <div>{children}</div>;
};

const Tooltip = ({ children }: TooltipProps) => {
  return <div className="relative inline-block">{children}</div>;
};

const TooltipTrigger = ({ children, setIsVisible }: TooltipTriggerProps) => {
  return <div
    onMouseEnter={() => setIsVisible(true)}
    onMouseLeave={() => setIsVisible(false)}>
    {children}
  </div>;
};

const TooltipContent = ({ children, isVisible }: TooltipContentProps) => {
  console.log(children?.toString())
  return (
    <div className="relative inline-flex">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 min-w-40 max-w-md px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg dark:bg-gray-900 dark:text-gray-100"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
