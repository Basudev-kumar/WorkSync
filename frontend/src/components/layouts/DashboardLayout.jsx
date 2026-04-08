// components/layouts/DashboardLayout

import React, { useContext } from "react";
import { UserContext } from "../../context/userContext";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";


const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);

  return (
    <div className="min-h-screen bg-[#fcfbfc] dark:bg-[#0f1117] transition-colors duration-200">
      <Navbar activeMenu={activeMenu} />

      {user && (
        <div className="flex">
          <div className="max-[1080px]:hidden">
            <SideMenu activeMenu={activeMenu} />
          </div>
          <main className="grow mx-5 text-gray-900 dark:text-slate-100">
            {children}
          </main>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
