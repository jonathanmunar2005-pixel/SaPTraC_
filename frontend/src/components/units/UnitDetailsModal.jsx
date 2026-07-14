import AvailabilityBadge from "./AvailabilityBadge";
import MaintenanceBadge from "./MaintenanceBadge";

const UnitDetailsModal = ({ open, unit, onClose }) => {
  if (!open || !unit) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xl p-6 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Unit Details</h2>
        
        <div className="space-y-3 mb-6 text-xs text-slate-700">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Plate Number</span>
            <span className="font-semibold text-slate-800">{unit.plateNumber}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Body Number</span>
            <span className="font-semibold text-slate-800">{unit.bodyNumber}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Route</span>
            <span className="font-semibold text-slate-800">{unit.route || "-"}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Type</span>
            <span className="font-semibold text-slate-800">{unit.unitType}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Fuel</span>
            <span className="font-semibold text-slate-800">{unit.fuelType}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Capacity</span>
            <span className="font-semibold text-slate-800">{unit.capacity}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2 items-center">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Availability</span>
            <AvailabilityBadge status={unit.availabilityStatus} />
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2 items-center">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Maintenance</span>
            <MaintenanceBadge status={unit.maintenanceStatus} />
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Registration Expiry</span>
            <span className="font-semibold text-slate-800">{unit.registrationExpiry?.slice(0,10)}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Insurance Expiry</span>
            <span className="font-semibold text-slate-800">{unit.insuranceExpiry?.slice(0,10)}</span>
          </div>

          <div className="flex flex-col items-center pt-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] self-start mb-2">QR Code</span>
            {unit.qrCode ? (
              <img src={unit.qrCode} alt="QR Code" className="w-32 h-32 rounded-lg border border-slate-200 shadow-xs" />
            ) : (
              <span className="text-[10px] text-slate-400 font-medium italic">No QR code available</span>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200/60 transition-all duration-150 active:scale-95 shadow-xs" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default UnitDetailsModal;
