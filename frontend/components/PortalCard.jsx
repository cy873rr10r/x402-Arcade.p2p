// components/PortalCard.jsx
import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function PortalCard({ title, subtitle, cta, onClick, accent="yellow" }) {
  const gradient = accent === "yellow" 
    ? "bg-gradient-to-br from-yellow-400/20 via-yellow-300/10 to-transparent"
    : "bg-gradient-to-br from-purple-500/10 via-pink-400/6 to-transparent";

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        "relative w-full max-w-md min-h-[180px] rounded-2xl p-6 border border-white/6 backdrop-blur-sm flex flex-col justify-between",
        gradient
      )}
      style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.6)" }}
    >
      <div className="absolute -inset-1 rounded-2xl opacity-40 blur-xl" style={{ background: "linear-gradient(90deg, rgba(255,213,74,0.06), rgba(255,184,107,0.03))" }} />
      <div className="relative z-10">
        <h3 className="text-2xl font-bold tracking-wide text-[#fff]">{title}</h3>
        <p className="mt-3 text-sm text-white/70 leading-snug">{subtitle}</p>
        <div className="mt-6">
          <button onClick={onClick} className="px-6 py-3 rounded-lg font-semibold bg-[#ffd54a] text-black hover:bg-[#ffb86b] shadow-md">
            {cta}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
