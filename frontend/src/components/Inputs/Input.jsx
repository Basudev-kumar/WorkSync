import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({ value, onChange, label, placeholder, type = "text" }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="mb-4 w-full">
      {label && (
        <label className="text-[13px] text-slate-800 mb-1 block">
          {label}
        </label>
      )}
     
      <div className="relative">
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e)}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-md p-2 pr-10 bg-transparent outline-none text-sm"
        />
        {type === "password" && (
          <span
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
            onClick={toggleShowPassword}
          >
            {showPassword ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
          </span>
        )}
      </div>
    </div>
  );
};

export default Input;


