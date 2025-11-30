"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function HideableAddressInput({
  label,
  address,
  onChange,
  placeholder,
  initialHidden = true,
}) {
  const [isHidden, setIsHidden] = useState(initialHidden);

  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };

  const maskedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div className="relative">
      <label className="block text-white/70 text-lg font-semibold mb-3">{label}</label>
      <input
        type="text"
        value={isHidden ? maskedAddress : address}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={isHidden && address !== ""} // Make read-only if hidden and an address is present
        className={clsx(
          "w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#ffd54a]",
          isHidden && address !== "" && "text-white/50"
        )}
      />
      {address && ( // Only show toggle if there's an address to hide/show
        <motion.button
          onClick={toggleVisibility}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm focus:outline-none"
          title={isHidden ? "Show Full Address" : "Hide Full Address"}
        >
          {isHidden ? "👁️" : "🔒"}
        </motion.button>
      )}
    </div>
  );
}
