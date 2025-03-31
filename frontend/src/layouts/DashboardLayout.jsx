"use client";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAppContext } from "../contexts/ThemeContext";
import {
  AudioWaveformIcon as WaveformIcon,
  LibraryIcon,
  SettingsIcon,
  HelpCircleIcon,
  HomeIcon,
  MessageSquareTextIcon,
  Music4,
} from "lucide-react";

const navItems = [
  {
    name: "Home",
    path: "/",
    icon: HomeIcon,
  },
  {
    name: "Drum Sample Generator",
    path: "/dashboard/audio",
    icon: WaveformIcon,
  },
  {
    name: "Text to Sample Generator",
    path: "/dashboard/audio2",
    icon: MessageSquareTextIcon,
  },
  {
    name: "Library",
    path: "/dashboard/library",
    icon: LibraryIcon,
  },
  {
    name: "Settings",
    path: "/dashboard/settings",
    icon: SettingsIcon,
  },
  {
    name: "Help",
    path: "/dashboard/help",
    icon: HelpCircleIcon,
  },
];

export default function DashboardLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const { darkMode } = useAppContext();

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar / Tab Bar */}
      <div
        className={`w-64 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-r flex flex-col`}
      >
        <div
          className={`p-4 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h1 className="text-xl font-bold text-indigo-600 flex items-center">
            <Music4 className="mr-2" />
            Autosampler
          </h1>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.path ||
                (item.path !== "/" && pathname.startsWith(item.path));

              return (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                        isActive
                          ? darkMode
                            ? "bg-indigo-900/50 text-indigo-400 font-medium"
                            : "bg-indigo-50 text-indigo-600 font-medium"
                          : darkMode
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-100"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn(
                            "mr-3 h-5 w-5",
                            isActive
                              ? darkMode
                                ? "text-indigo-400"
                                : "text-indigo-600"
                              : darkMode
                              ? "text-gray-400"
                              : "text-gray-500"
                          )}
                        />
                        {item.name}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
              U
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">User</p>
              <p className="text-xs text-gray-500">user@example.com</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
