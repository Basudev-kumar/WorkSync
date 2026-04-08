import React from "react";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#252a40] shadow-md rounded-lg p-3 border border-gray-200 dark:border-slate-600">
        <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1">
          {payload[0].name}
        </p>
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Count:{" "}
          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
            {payload[0].value}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
