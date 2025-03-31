"use client";

// import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Save, Moon, Sun, Volume2, Zap, HardDrive, Bell } from "lucide-react";
import { useAppContext } from "../contexts/ThemeContext";

export default function SettingsPage() {
  const { darkMode, toggleDarkMode, volume, updateVolume } = useAppContext();
  //   const [notifications, setNotifications] = useState(true);
  //   const [autoSave, setAutoSave] = useState(true);
  //   const [isSaving, setIsSaving] = useState(false);

  //   const handleSaveSettings = () => {
  //     setIsSaving(true);

  //     // Simulate saving settings
  //     setTimeout(() => {
  //       setIsSaving(false);
  //     }, 1000);
  //   };

  const handleVolumeChange = (value) => {
    updateVolume(value[0]);
  };

  return (
    <main className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Customize your audio editing experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Appearance
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {darkMode ? (
                  <Moon className="text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Sun className="text-amber-500" />
                )}
                <div>
                  <Label htmlFor="dark-mode" className="dark:text-white">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Switch between light and dark themes
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </div>
        </Card>

        {/* Audio Settings */}
        <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Audio Settings
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="volume-slider"
                  className="flex items-center dark:text-white"
                >
                  <Volume2 className="mr-2 text-gray-500 dark:text-gray-400" />
                  Volume
                </Label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {volume}%
                </span>
              </div>
              <Slider
                id="volume-slider"
                value={[volume]}
                max={100}
                step={1}
                className="w-full"
                onValueChange={handleVolumeChange}
              />
            </div>

            {/* <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="quality-slider" className="flex items-center">
                  <Zap className="mr-2 text-gray-500" />
                  Processing Quality
                </Label>
                <span className="text-sm text-gray-500">{quality}%</span>
              </div>
              <Slider
                id="quality-slider"
                value={[quality]}
                max={100}
                step={5}
                className="w-full"
                onValueChange={(value) => setQuality(value[0])}
              />
              <p className="text-xs text-gray-500">
                Higher quality requires more processing power
              </p>
            </div> */}
          </div>
        </Card>

        {/* Storage & Notifications */}
        {/* <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">System</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="text-gray-500" />
                <div>
                  <Label htmlFor="auto-save" className="dark:text-white">
                    Auto Save
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically save your work
                  </p>
                </div>
              </div>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="text-gray-500" />
                <div>
                  <Label htmlFor="notifications" className="dark:text-white">
                    Notifications
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive processing notifications
                  </p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>
        </Card> */}

        {/* Save Button */}
        {/* <div className="flex justify-end">
          <Button
            className="flex items-center gap-2"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="animate-spin">
                  <Save size={18} />
                </span>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </Button>
        </div> */}
      </div>
    </main>
  );
}
