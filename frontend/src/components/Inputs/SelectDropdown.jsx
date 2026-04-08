// components/Inputs/SelectDropdown

import React, { useState, useEffect, useRef } from "react";
import { LuChevronDown } from "react-icons/lu";

const SelectDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Close on click-outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || placeholder;

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full text-black dark:text-slate-100 outline-none flex items-center justify-between px-3 py-2.5 border border-slate-100 dark:border-slate-600 rounded-md mt-2 bg-white dark:bg-slate-800 transition-colors duration-150"
      >
        <span>{selectedLabel}</span>
        <LuChevronDown
          className={`ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute mt-1 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-600 rounded-md shadow-lg dark:shadow-slate-900 z-20">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors duration-100 ${
                option.value === value
                  ? "bg-blue-50 dark:bg-blue-900/30 text-primary"
                  : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
