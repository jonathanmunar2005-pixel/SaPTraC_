import { useContext } from "react";
import AuthContext from "../lib/AuthContext";

const RoleDashboard = () => {
  const { user } = useContext(AuthContext);

  const isManagement = ["Super Admin", "Administrator"].includes(user?.role);
  const isOpManager = user?.role === "Operational Manager";

  return (
    <div className="min-h-screen bg-slate-55 bg-slate-50 p-6 md:p-8 text-slate-800">
      {/* Dashboard Overview / Welcome Card */}
      <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm mb-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome, {user?.name || user?.email}</h1>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Role: {user?.role}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {/* User Management Card */}
        {(isManagement) && (
          <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-100">User Management</h3>
            <p className="text-xs text-slate-500 font-medium mb-3">Manage user accounts, credentials, and role permissions.</p>
            <ul className="list-disc list-inside text-[11px] text-slate-455 text-slate-400 space-y-1">
              <li>Manage users & settings</li>
              <li>Seed super admin accounts</li>
            </ul>
          </div>
        )}

        {/* Driver Card */}
        {(isManagement || isOpManager) && (
          <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-100">Driver Overview</h3>
            <p className="text-xs text-slate-500 font-medium mb-3">Manage transport driver profiles, status updates, and credentials.</p>
            <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
              <li>Register new drivers</li>
              <li>View profile details</li>
            </ul>
          </div>
        )}

        {/* Unit Card */}
        {(isManagement || isOpManager) && (
          <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-100">Unit Overview</h3>
            <p className="text-xs text-slate-500 font-medium mb-3">Manage cooperative transport fleet units and body numbers.</p>
            <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
              <li>Manage routes & capacities</li>
              <li>View availability stats</li>
            </ul>
          </div>
        )}

        {/* Scheduling Card */}
        {(isManagement || isOpManager) && (
          <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-100">Scheduling Overview</h3>
            <p className="text-xs text-slate-500 font-medium mb-3">Manage transport schedule plans, driver shifts, and routes.</p>
            <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
              <li>Manage shift assignments</li>
              <li>View daily schedules</li>
            </ul>
          </div>
        )}

        {/* Analytics Card */}
        {(isManagement || isOpManager) && (
          <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-100">Analytics Overview</h3>
            <p className="text-xs text-slate-500 font-medium mb-3">View cooperative revenue overview and performance analytics.</p>
            <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
              <li>Track revenue charts</li>
              <li>View KPI indicators</li>
            </ul>
          </div>
        )}

        {/* Fuel Card */}
        {(isManagement || user?.role === "Fuel Pump Attendant") && (
          <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-100">Fuel Monitoring</h3>
            <p className="text-xs text-slate-500 font-medium mb-3">Monitor fuel consumption, transactions, and anomaly detections.</p>
            <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
              <li>Register fuel logs</li>
              <li>Verify consumption anomalies</li>
            </ul>
          </div>
        )}

        {/* Remittance Card */}
        {(isManagement || user?.role === "Cashier") && (
          <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-100">Remittances</h3>
            <p className="text-xs text-slate-500 font-medium mb-3">Review collections, daily remittances, and balances.</p>
            <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
              <li>Track collected balances</li>
              <li>Verify driver accounts</li>
            </ul>
          </div>
        )}

        {/* Maintenance Card */}
        {(isManagement || user?.role === "Mechanic") && (
          <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-100">Maintenance Panel</h3>
            <p className="text-xs text-slate-500 font-medium mb-3">Track vehicle repair schedules, maintenance actions, and timelines.</p>
            <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
              <li>View assigned repairs</li>
              <li>Track diagnostic timeline</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleDashboard;
