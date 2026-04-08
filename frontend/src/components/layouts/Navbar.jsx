import React, { useState, useRef, useEffect } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi";
import SideMenu from "./SideMenu";
import { useTheme } from "../../context/themeContext";


const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const drawerRef = useRef(null);
  const { isDark, toggleTheme } = useTheme();

  // Close drawer when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setOpenSideMenu(false);
      }
    };

    if (openSideMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openSideMenu]);

  return (
    <div className="flex items-center gap-5 bg-white dark:bg-[#13172a] border-b border-gray-200/50 dark:border-slate-700/60 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30 transition-colors duration-200">

      {/* Mobile menu toggle */}
      <button
        className="block lg:hidden text-black dark:text-slate-200"
        onClick={() => setOpenSideMenu((prev) => !prev)}
        aria-label={openSideMenu ? "Close menu" : "Open menu"}
      >
        {openSideMenu ? (
          <HiOutlineX className="text-2xl" />
        ) : (
          <HiOutlineMenu className="text-2xl" />
        )}
      </button>

      {/* App title */}
      <h2 className="text-lg font-medium text-black dark:text-slate-100 flex-1">
        Task Manager
      </h2>

      {/* ── Dark / Light mode toggle (top-right) ── */}
      <button
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={`
          relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none
          focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          ${isDark ? "bg-primary" : "bg-gray-200"}
        `}
      >
        {/* Sliding knob */}
        <span
          className={`
            absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md
            flex items-center justify-center
            transition-transform duration-300
            ${isDark ? "translate-x-7" : "translate-x-0"}
          `}
        >
          {isDark ? (
            <HiOutlineMoon className="text-primary text-sm" />
          ) : (
            <HiOutlineSun className="text-amber-500 text-sm" />
          )}
        </span>
      </button>

      {/* Mobile side-menu drawer with overlay */}
      {openSideMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-[61px] bg-black/20 z-40"
            onClick={() => setOpenSideMenu(false)}
          />
          {/* Drawer panel */}
          <div
            ref={drawerRef}
            className="fixed top-[61px] left-0 z-50 shadow-xl"
          >
            <SideMenu
              activeMenu={activeMenu}
              onClose={() => setOpenSideMenu(false)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;
