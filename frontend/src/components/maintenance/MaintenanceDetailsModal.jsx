const MaintenanceDetailsModal = ({
  open,
  maintenance,
  onClose,
}) => {
  if (!open || !maintenance) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95 duration-150">

        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Maintenance Details
        </h2>

        <div className="space-y-3 my-4">

          <p className="text-xs text-slate-650 border-b border-slate-100/60 pb-2 flex justify-between last:border-0 last:pb-0">
            <strong className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit:</strong>{" "}
            {maintenance.unit?.plateNumber || "-"}
          </p>

          <p className="text-xs text-slate-650 border-b border-slate-100/60 pb-2 flex justify-between last:border-0 last:pb-0">
            <strong className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue Title:</strong>{" "}
            {maintenance.issueTitle}
          </p>

          <p className="text-xs text-slate-655 border-b border-slate-100/60 pb-2 flex justify-between last:border-0 last:pb-0">
            <strong className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description:</strong>{" "}
            {maintenance.issueDescription}
          </p>

          <p className="text-xs text-slate-650 border-b border-slate-100/60 pb-2 flex justify-between last:border-0 last:pb-0">
            <strong className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category:</strong>{" "}
            {maintenance.issueCategory}
          </p>

          <p className="text-xs text-slate-650 border-b border-slate-100/60 pb-2 flex justify-between last:border-0 last:pb-0">
            <strong className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority:</strong>{" "}
            {maintenance.priorityLevel}
          </p>

          <p className="text-xs text-slate-650 border-b border-slate-100/60 pb-2 flex justify-between last:border-0 last:pb-0">
            <strong className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</strong>{" "}
            {maintenance.maintenanceStatus}
          </p>

          <p className="text-xs text-slate-650 border-b border-slate-100/60 pb-2 flex justify-between last:border-0 last:pb-0">
            <strong className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maintenance Type:</strong>{" "}
            {maintenance.maintenanceType}
          </p>

          <p className="text-xs text-slate-650 border-b border-slate-100/60 pb-2 flex justify-between last:border-0 last:pb-0">
            <strong className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reported Date:</strong>{" "}
            {maintenance.reportedDate
              ? new Date(
                  maintenance.reportedDate
                ).toLocaleDateString()
              : "-"}
          </p>

          <p className="text-xs text-slate-650 border-b border-slate-100/60 pb-2 flex justify-between last:border-0 last:pb-0">
            <strong className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remarks:</strong>{" "}
            {maintenance.remarks || "None"}
          </p>

        </div>

        <div className="flex justify-end mt-6 border-t border-slate-100 pt-3.5">
          <button
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200/60 transition-all duration-150 active:scale-95 shadow-xs"
            onClick={onClose}
          >
            Close
          </button>
        </div>
 
      </div>
    </div>
  );
};

export default MaintenanceDetailsModal;