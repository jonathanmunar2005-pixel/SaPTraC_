import { CheckCircle, History, StickyNote, UserCog, Wrench } from "lucide-react";

const ACTION_ICONS = {
  IssueCreated: <History className="size-4 text-blue-500" />,
  MechanicAssigned: <UserCog className="size-4 text-indigo-500" />,
  StatusUpdated: <Wrench className="size-4 text-yellow-500" />,
  RepairCompleted: <CheckCircle className="size-4 text-green-600" />,
  PartsReplaced: <Wrench className="size-4 text-gray-700" />,
  MaintenanceNoteAdded: <StickyNote className="size-4 text-purple-500" />,
};

const STATUS_COLORS = {
  "Pending": "bg-amber-50 text-amber-700 border-amber-200/60",
  "Diagnosed": "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200/60",
  "Waiting Parts": "bg-purple-50 text-purple-700 border-purple-200/60",
  "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  "Cancelled": "bg-slate-100 text-slate-600 border-slate-200",
};

function formatDate(date) {
  return new Date(date).toLocaleString();
}

const MaintenanceTimeline = ({ history = [], loading = false, error = "" }) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-slate-50/30 rounded-xl border border-slate-100 shadow-sm">
      <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Maintenance Timeline</h2>
      {loading ? (
        <div className="flex justify-center items-center h-24">
          <span className="loading loading-spinner loading-lg text-blue-600"></span>
        </div>
      ) : error ? (
        <div className="text-red-650 text-center py-8 text-xs font-semibold">{error}</div>
      ) : history.length === 0 ? (
        <div className="text-slate-400 text-center py-8 text-xs italic font-medium">No repair history found.</div>
      ) : (
        <ol className="relative border-l border-slate-200 ml-2">
          {(Array.isArray(history) ? history : []).map((item, idx) => (
            <li key={item._id || idx} className="mb-6 ml-6 flex flex-col group">
              <span className="absolute -left-3.5 flex items-center justify-center w-7 h-7 bg-white border border-slate-250 rounded-full shadow-xs group-hover:border-blue-500 transition-colors duration-150">
                {ACTION_ICONS[item.actionType] || <History className="size-4 text-slate-400" />}
              </span>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">{(item.actionType || "Unknown").replace(/([A-Z])/g, " $1").trim()}</span>
                  {item.newData?.status && (
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold border ${STATUS_COLORS[item.newData.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {item.newData.status}
                    </span>
                  )}
                  <span className="ml-auto text-[10px] font-medium text-slate-400">{formatDate(item.createdAt)}</span>
                </div>
                <div className="mt-1 text-xs text-slate-650">
                  {item.notes && <div className="mb-1 text-xs italic text-slate-500">"{item.notes}"</div>}
                  {item.performedBy && (
                    <div className="text-[10px] font-medium text-slate-400">By: {item.performedBy.fullName || item.performedBy.name || item.performedBy.email || "Unknown"}</div>
                  )}
                  {/* Mechanic activity tracking */}
                  {item.actionType === "MechanicAssigned" && item.newData?.mechanic && (
                    <div className="text-[10px] font-bold text-blue-600">Assigned to: {item.newData.mechanic.fullName || item.newData.mechanic.name || "Mechanic"}</div>
                  )}
                  {/* Show changes if available */}
                  {item.previousData && item.newData && (
                    <div className="mt-1.5 text-[10px] text-slate-400 font-mono bg-slate-50 p-1.5 rounded border border-slate-100">
                      <span className="font-semibold">Change:</span> {JSON.stringify(item.previousData)} → {JSON.stringify(item.newData)}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default MaintenanceTimeline;
