import DriverStatusBadge from "./DriverStatusBadge";

const DriverDetailsModal = ({ open, driver, onClose }) => {
  if (!open || !driver) return null;
  console.log(driver);
  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xl p-6 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-150">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Driver Details</h2>
        
        <div className="space-y-3.5 mb-6 text-xs text-slate-700">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Name</span>
            <span className="font-semibold text-slate-800">{driver.firstName} {driver.middleName} {driver.lastName}</span>
          </div>
          
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Email</span>
            <span className="font-semibold text-slate-800">{driver.email}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2 items-center">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</span>
            <DriverStatusBadge status={driver.status} />
          </div>

          <div className="flex flex-col items-center pt-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] self-start mb-2">QR Code</span>
            {driver.qrCode ? (
              <img src={driver.qrCode} alt="QR Code" className="w-32 h-32 rounded-lg border border-slate-200 shadow-xs" />
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

export default DriverDetailsModal;
