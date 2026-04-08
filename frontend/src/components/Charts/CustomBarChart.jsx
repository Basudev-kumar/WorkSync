// components/Charts/CustomBarChart

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { useTheme } from "../../context/themeContext";

const CustomBarChart = ({ data }) => {
    const { isDark } = useTheme();

    const tickColor = isDark ? "#94a3b8" : "#555";      // slate-400 in dark
    const bgColor   = isDark ? "#1a1d2e" : "#ffffff";   // card dark bg

    const getBarColor = (entry) => {
        switch (entry?.priority) {
            case "Low":    return "#00BC7D";
            case "Medium": return "#FE9900";
            case "High":   return "#FF1F57";
            default:       return "#00BC7D";
        }
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-[#252a40] shadow-md rounded-lg p-2 border border-gray-200 dark:border-slate-600">
                    <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1">
                        {payload[0].payload.priority}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-slate-300">
                        Count:{" "}
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {payload[0].payload.count}
                        </span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="mt-6" style={{ backgroundColor: bgColor }}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid stroke="none" />

                    <XAxis
                        dataKey="priority"
                        tick={{ fontSize: 12, fill: tickColor }}
                        stroke="none"
                    />

                    <YAxis
                        tick={{ fontSize: 12, fill: tickColor }}
                        stroke="none"
                    />

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: isDark ? "rgba(255,255,255,0.05)" : "transparent" }}
                    />

                    <Bar
                        dataKey="count"
                        nameKey="priority"
                        radius={[10, 10, 0, 0]}
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={getBarColor(entry)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomBarChart;
