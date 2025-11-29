import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Monitor, Printer, Save, Shield } from "lucide-react";
import { toast } from "react-toastify";

// UI Components (inline, no separate folder)
const Button = ({ className = "", variant = "default", size = "default", ...props }) => {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    default: "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--accent-color)] text-white px-4 py-2 hover:opacity-90 hover:shadow-lg",
    outline: "border-2 border-gray-200 bg-white text-[var(--primary-color)] px-4 py-2 hover:bg-gray-50 hover:border-[var(--accent-color)]/30",
  };
  
  const sizes = {
    default: "text-sm",
    sm: "text-xs px-3 py-1.5",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
};

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:border-[var(--accent-color)] transition-all ${className}`}
    {...props}
  />
);

const Label = ({ className = "", children, ...props }) => (
  <label className={`text-sm font-medium text-[var(--primary-color)] ${className}`} {...props}>
    {children}
  </label>
);

const Switch = ({ defaultChecked, onChange }) => {
  const [checked, setChecked] = useState(!!defaultChecked);

  const toggle = () => {
    const next = !checked;
    setChecked(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
        checked ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--accent-color)]" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
};

// Select Components
const Select = ({ value, defaultValue, onValueChange, children }) => {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = value !== undefined ? value : internal;

  const handleChange = (e) => {
    setInternal(e.target.value);
    onValueChange?.(e.target.value);
  };

  return React.cloneElement(children, { value: current, onChange: handleChange });
};

const SelectTrigger = ({ className = "", children, ...props }) => (
  <select
    className={`w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:border-[var(--accent-color)] transition-all ${className}`}
    {...props}
  >
    {children}
  </select>
);

const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);

// Card Components
const Card = ({ className = "", children }) => (
  <div className={`rounded-xl border-2 border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ className = "", children }) => (
  <div className={`border-b border-gray-100 px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ className = "", children }) => (
  <h2 className={`text-lg font-semibold text-[var(--primary-color)] ${className}`}>
    {children}
  </h2>
);

const CardDescription = ({ className = "", children }) => (
  <p className={`text-sm text-gray-500 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ className = "", children }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// Tabs Components
const Tabs = ({ defaultValue, children }) => {
  const [value, setValue] = useState(defaultValue);
  return React.Children.map(children, (child) =>
    React.cloneElement(child, { value, setValue })
  );
};

const TabsList = ({ className = "", value, setValue, children }) => (
  <div className={`inline-grid rounded-xl bg-gray-100 p-1 text-sm font-medium shadow-sm ${className}`}>
    {React.Children.map(children, (child) =>
      React.cloneElement(child, { current: value, setValue })
    )}
  </div>
);

const TabsTrigger = ({ value: tabValue, current, setValue, children }) => {
  const active = current === tabValue;
  return (
    <button
      type="button"
      onClick={() => setValue(tabValue)}
      className={`flex items-center justify-center rounded-lg px-3 py-1.5 transition-all ${
        active
          ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--accent-color)] text-white shadow-sm font-semibold"
          : "text-gray-600 hover:text-[var(--primary-color)] hover:bg-white/60"
      }`}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ tab, value, children }) => 
  tab === value ? <div className="mt-6">{children}</div> : null;

const Separator = () => <div className="h-px w-full bg-gray-200" />;

// Main Settings Component
export default function Settings() {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Settings saved successfully! Your preferences have been updated.", {
        position: "top-right",
        autoClose: 3000,
      });
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl p-6 bg-gray-50 min-h-screen"
    >
      {/* Header with Save Button */}
      <div className="flex justify-end mb-8">
        <Button 
          onClick={handleSave} 
          disabled={loading} 
          className="gap-2 px-6 py-2.5 font-medium shadow-md"
        >
          {loading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <Save className="h-4 w-4" />
          )}
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent tab="general" value="general">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-[var(--accent-color)]" />
                  Display & Interface
                </CardTitle>
                <CardDescription>
                  Customize how the dashboard looks and behaves.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto Refresh Dashboard</Label>
                    <p className="text-sm text-gray-500">
                      Automatically update patient lists and stats.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Refresh Interval</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectItem value="15">Every 15 seconds</SelectItem>
                        <SelectItem value="30">Every 30 seconds</SelectItem>
                        <SelectItem value="60">Every minute</SelectItem>
                      </SelectTrigger>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectTrigger>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[var(--accent-color)]" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue="FrontDesk Staff" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input defaultValue="frontdesk@pocketclinic.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input defaultValue="+91 98765 43210" />
                  </div>
                  <div className="space-y-2">
                    <Label>Employee ID</Label>
                    <Input
                      defaultValue="EMP-2024-001"
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent tab="notifications" value="notifications">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[var(--accent-color)]" />
                  Alert Preferences
                </CardTitle>
                <CardDescription>Manage how you receive notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">New Patient Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when a new patient registers online.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Appointment Reminders</Label>
                    <p className="text-sm text-gray-500">
                      Receive reminders 15 mins before appointments.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Sound Effects</Label>
                    <p className="text-sm text-gray-500">
                      Play a sound when a new token is generated.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Hardware Tab */}
        <TabsContent tab="hardware" value="hardware">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5 text-[var(--accent-color)]" />
                  Printer Configuration
                </CardTitle>
                <CardDescription>
                  Manage connected devices for token printing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Token Printer</Label>
                    <Select defaultValue="hp">
                      <SelectTrigger>
                        <SelectItem value="hp">HP LaserJet Pro M404dw</SelectItem>
                        <SelectItem value="canon">Canon Pixma G3000</SelectItem>
                        <SelectItem value="epson">Epson Thermal POS-80</SelectItem>
                      </SelectTrigger>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border-2 border-green-100 bg-green-50/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      <div>
                        <p className="text-sm font-medium text-[var(--primary-color)]">Status: Connected</p>
                        <p className="text-xs text-gray-500">Ready to print</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-300">
                      Test Print
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent tab="security" value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[var(--accent-color)]" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage password and session security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input type="password" />
                    </div>
                  </div>
                  <Button className="w-full md:w-auto">Update Password</Button>
                </div>
                <Separator />
                <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto Logout</Label>
                    <p className="text-sm text-gray-500">
                      Lock screen after inactivity.
                    </p>
                  </div>
                  <Select defaultValue="15">
                    <SelectTrigger className="w-[180px]">
                      <SelectItem value="5">5 Minutes</SelectItem>
                      <SelectItem value="15">15 Minutes</SelectItem>
                      <SelectItem value="30">30 Minutes</SelectItem>
                    </SelectTrigger>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
