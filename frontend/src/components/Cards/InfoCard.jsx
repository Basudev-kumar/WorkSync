// components/Cards/InfoCard

import React from "react";

const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 md:w-2 h-4 md:h-5 ${color} rounded-full`} />

      <div className="text-xs md:text-sm text-gray-500 dark:text-slate-400 leading-tight">
        <span className="text-sm md:text-base text-black dark:text-slate-100 font-semibold mr-1">
          {value}
        </span>
        {label}
      </div>
    </div>
  );
};

export default InfoCard;
