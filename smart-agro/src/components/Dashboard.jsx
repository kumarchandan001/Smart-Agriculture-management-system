import React, { useState } from "react";
import {
  Cloud,
  TrendingUp,
  Droplets,
  Bug,
  BookOpen,
  DollarSign,
  PieChart,
  Sprout,
  Grid,
} from "lucide-react";

// Mock Auth Context
import { useAuth } from "../AuthContext";
import CropRec from "./features/CropRec";
import Predict from "./features/Predict";
import Fertilizer from "./features/Fertilizer";
import Weather from "./features/Weather";
import Market from "./features/Market";
import Expenses from "./filters/Expenses";
import Soil from "./features/Soil";
import Pest from "./features/Pest";
import Knowledge from "./features/Knowledge";

// Mock Feature Components
// const CropRec = () => (
//   <div className="text-gray-600">Crop Recommendation Feature</div>
// );
// const Predict = () => (
//   <div className="text-gray-600">Crop Prediction Feature</div>
// );
// const Fertilizer = () => (
//   <div className="text-gray-600">Fertilizer Guide Feature</div>
// );
// const Weather = () => (
//   <div className="text-gray-600">Weather Forecast Feature</div>
// );
// const Market = () => <div className="text-gray-600">Market Prices Feature</div>;
// const Expenses = () => (
//   <div className="text-gray-600">Expense Tracker Feature</div>
// );
// const Soil = () => <div className="text-gray-600">Soil Health Feature</div>;
// const Pest = () => <div className="text-gray-600">Pest & Disease Feature</div>;
// const Knowledge = () => (
//   <div className="text-gray-600">Knowledge Hub Feature</div>
// );

const MENU = [
  {
    id: "crop",
    label: "Crop Recommendation",
    icon: Sprout,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    id: "predict",
    label: "Crop Prediction",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "fert",
    label: "Fertilizer Guide",
    icon: Droplets,
    color: "from-purple-500 to-pink-600",
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    id: "weather",
    label: "Weather Forecast",
    icon: Cloud,
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    id: "market",
    label: "Market Prices",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    id: "expenses",
    label: "Expense Tracker",
    icon: PieChart,
    color: "from-orange-500 to-red-600",
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    id: "soil",
    label: "Soil Health",
    icon: Grid,
    color: "from-amber-500 to-yellow-600",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    id: "pest",
    label: "Pest & Disease",
    icon: Bug,
    color: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    id: "knowledge",
    label: "Knowledge Hub",
    icon: BookOpen,
    color: "from-indigo-500 to-purple-600",
    bg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [active, setActive] = useState("crop");

  const renderActive = () => {
    switch (active) {
      case "crop":
        return <CropRec />;
      case "predict":
        return <Predict />;
      case "fert":
        return <Fertilizer />;
      case "weather":
        return <Weather />;
      case "market":
        return <Market />;
      case "expenses":
        return <Expenses />;
      case "soil":
        return <Soil />;
      case "pest":
        return <Pest />;
      case "knowledge":
        return <Knowledge />;
      default:
        return <div className="p-4 text-gray-500">Select a feature</div>;
    }
  };

  const activeItem = MENU.find((m) => m.id === active);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Farm Dashboard
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Welcome back,{" "}
                <span className="font-semibold text-emerald-700">
                  {user?.name || user?.email || "Farmer"}
                </span>{" "}
                🌱
              </p>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Feature Cards - Left Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-3">
              Your Tools
            </h3>
            {MENU.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`
                    w-full group relative overflow-hidden rounded-2xl p-4 
                    transition-all duration-300 ease-out
                    ${
                      isActive
                        ? "bg-white shadow-xl shadow-emerald-100 scale-[1.02]"
                        : "bg-white/60 hover:bg-white hover:shadow-lg hover:scale-[1.01]"
                    }
                  `}
                >
                  {isActive && (
                    <div
                      className={`absolute inset-0 bg-linear-to-r ${item.color} opacity-5`}
                    />
                  )}

                  <div className="relative flex items-center gap-4">
                    <div
                      className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      transition-all duration-300
                      ${
                        isActive
                          ? `bg-linear-to-br ${item.color} shadow-lg`
                          : `${item.bg} group-hover:scale-110`
                      }
                    `}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          isActive ? "text-white" : item.iconColor
                        }`}
                      />
                    </div>

                    <div className="flex-1 text-left">
                      <p
                        className={`
                        font-semibold transition-colors
                        ${
                          isActive
                            ? "text-gray-900"
                            : "text-gray-700 group-hover:text-gray-900"
                        }
                      `}
                      >
                        {item.label}
                      </p>
                    </div>

                    {isActive && (
                      <div
                        className={`w-2 h-2 rounded-full bg-linear-to-br ${item.color}`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden">
              {/* Content Header */}
              <div className={`bg-linear-to-r ${activeItem.color} p-6`}>
                <div className="flex items-center gap-3">
                  {React.createElement(activeItem.icon, {
                    className: "w-8 h-8 text-white",
                  })}
                  <h2 className="text-2xl font-bold text-white">
                    {activeItem.label}
                  </h2>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 md:p-8 min-h-[500px]">{renderActive()}</div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-2xl p-4 shadow-md">
                <p className="text-xs text-gray-500 mb-1">Active Features</p>
                <p className="text-2xl font-bold text-gray-900">
                  {MENU.length}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-md">
                <p className="text-xs text-gray-500 mb-1">Season</p>
                <p className="text-2xl font-bold text-emerald-600">Spring</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-md">
                <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                <p className="text-2xl font-bold text-gray-900">Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
