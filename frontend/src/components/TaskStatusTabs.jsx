import React from 'react';

const TaskStatusTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="my-2">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`relative px-3 md:px-4 py-2 text-sm font-medium cursor-pointer transition-colors duration-150 ${
              activeTab === tab.label
                ? "text-primary"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            <div className="flex items-center">
              <span className="text-xs">{tab.label}</span>
              <span
                className={`text-xs ml-2 px-2 py-0.5 rounded-full transition-colors duration-150 ${
                  activeTab === tab.label
                    ? "bg-primary text-white"
                    : "bg-gray-200/70 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            </div>
            {activeTab === tab.label && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaskStatusTabs;