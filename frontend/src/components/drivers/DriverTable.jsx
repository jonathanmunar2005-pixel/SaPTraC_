import { useEffect, useState } from "react";
import DriverStatusBadge from "./DriverStatusBadge";
import useAuth from "../../lib/useAuth";
import api from "../../lib/axios";

const DriverTable = ({ onShowDetails, onAddDriver }) => {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/drivers")
      .then(res => {
        console.log("DRIVER RESPONSE:", res.data);
        // API may return either an array or an object with a `drivers` property
        const payload = res.data;
        const list = Array.isArray(payload) ? payload : (payload.drivers || []);
        console.log("LIST:", list);
        setDrivers(list);
      })
      .catch(err => setError(err.response?.data?.message || "Failed to load drivers"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm mt-4 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-7 bg-slate-200 rounded w-20"></div>
        </div>
        <div className="space-y-3.5">
          <div className="h-9 bg-slate-100 rounded"></div>
          <div className="h-9 bg-slate-100 rounded"></div>
          <div className="h-9 bg-slate-100 rounded"></div>
          <div className="h-9 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-200/60 text-rose-600 rounded-xl p-6 text-center text-xs font-semibold mt-4 shadow-sm">
        {error}
      </div>
    );
  }

  if (!Array.isArray(drivers)) {
    return (
      <div className="bg-white border border-rose-200/60 text-rose-600 rounded-xl p-6 text-center text-xs font-semibold mt-4 shadow-sm">
        Unexpected drivers data format
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white border border-slate-200/60 rounded-xl shadow-sm mt-4">
      <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Registered Drivers</span>
        {user?.role !== "Operational Manager" && (
          <button 
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 active:scale-95 hover:shadow-md flex items-center justify-center gap-1.5" 
            onClick={onAddDriver}
          >
            Add Driver
          </button>
        )}
      </div>
      <table className="min-w-full table-auto border-collapse text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200/60">
            <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</th>
            <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">QR Code</th>
            <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map(driver => (
            <tr 
              key={driver._id} 
              className="border-b border-slate-100 hover:bg-slate-50/55 transition-colors duration-150 odd:bg-white even:bg-slate-50/20"
            >
              <td className="px-5 py-3 text-xs font-semibold text-slate-800">
                {driver.name || `${driver.firstName || ''} ${driver.lastName || ''}`.trim()}
              </td>
              <td className="px-5 py-3 text-xs text-slate-600">
                {driver.email}
              </td>
              <td className="px-5 py-3 text-xs">
                <DriverStatusBadge status={driver.status} />
              </td>
              <td className="px-5 py-3 text-xs">
                {driver.qrCodeUrl ? (
                  <img src={driver.qrCodeUrl} alt="QR" className="w-8 h-8 rounded border border-slate-200/60 shadow-xs" />
                ) : (driver.qrCode && typeof driver.qrCode === 'string') ? (
                  <img src={driver.qrCode} alt="QR" className="w-8 h-8 rounded border border-slate-200/60 shadow-xs" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium italic">No QR</span>
                )}
              </td>
              <td className="px-5 py-3 text-xs text-right">
                <button 
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-md border border-slate-200/60 shadow-xs transition-all duration-150 active:scale-95" 
                  onClick={() => onShowDetails(driver)}
                >
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DriverTable;
