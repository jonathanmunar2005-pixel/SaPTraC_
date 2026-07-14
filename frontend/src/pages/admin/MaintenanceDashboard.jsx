import { useEffect, useState } from "react";
import { useMaintenanceApi } from "../../lib/maintenanceApi";
import useAuth from "../../lib/useAuth";
import { AlertCircle, RefreshCw, Search } from "lucide-react";
import api from "../../lib/axios";
import MaintenanceTimeline from "../../components/maintenance/MaintenanceTimeline";
import MaintenanceDetailsModal from "../../components/maintenance/MaintenanceDetailsModal";
import CreateMaintenanceModal from "../../components/maintenance/CreateMaintenanceModal";
import React from "react";
import { useUnitApi } from "../../lib/unitApi";
import { useUserApi } from "../../lib/userApi";

const STATUS_COLORS = {
  "Pending": "bg-amber-50 text-amber-700 border-amber-200/60",
  "Diagnosed": "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200/60",
  "Waiting Parts": "bg-purple-50 text-purple-700 border-purple-200/60",
  "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  "Cancelled": "bg-slate-100 text-slate-600 border-slate-200",
};

const PAGE_SIZE = 10;

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_COLORS[status] || "bg-slate-100 text-slate-650 border-slate-200"}`}>
    {status}
  </span>
);

const RecurringBadge = ({ detected, count }) =>
  detected ? (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200/60 text-[10px] font-semibold ml-2" title={`Recurring issue (${count} times)`}>
      <AlertCircle className="mr-1 size-3" /> Recurring ({count})
    </span>
  ) : null;

const Loader = () => (
  <div className="flex justify-center items-center h-40">
    <span className="loading loading-spinner loading-lg text-blue-600"></span>
  </div>
);

const MaintenanceDashboard = () => {
  const { getMaintenance, createMaintenance, updateMaintenance, updateMaintenanceStatus, assignMechanic,} = useMaintenanceApi();
  const { getUnits } = useUnitApi();
  const { getUsers } = useUserApi();
  
  const [units, setUnits] = useState([]);
  const [mechanics, setMechanics] = useState([]);

  const { user } = useAuth();

  const isAdmin =
  user?.role === "Super Admin" ||
  user?.role === "Administrator";

const isMechanic =
  user?.role === "Mechanic";
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingMaintenance, setEditingMaintenance] =
  useState(null);

  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const handleViewDetails = (record) => {
    setSelectedMaintenance(record);
  };
  
  const handleEdit = (record) => {
    console.log(record);
    setEditingMaintenance(record);
};

  const handleUpdateMaintenance = async (
  formData
) => {
  try {
    await updateMaintenance(
      editingMaintenance._id,
      formData
    );

    setEditingMaintenance(null);

    setRefreshing((r) => !r);
  } catch (err) {
    alert(
      err?.response?.data?.message ||
      "Failed to update maintenance."
    );
  }
};
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [assigning, setAssigning] = useState({});
  const [timelineData, setTimelineData] = useState({}); // { [maintenanceId]: { loading, error, history } }

  useEffect(() => {
  const loadDropdowns = async () => {
    try {
      const unitRes = await getUnits({
        limit: 100
      });

      setUnits(unitRes.units || []);

      const userRes = await getUsers();

      setMechanics(
        (userRes.users || []).filter(
          (u) => u.role === "Mechanic"
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  loadDropdowns();
}, []);
const handleCreateMaintenance = async (
  formData
) => {
  try {
    await createMaintenance(formData);

    setOpenCreateModal(false);

    setRefreshing((r) => !r);
  } catch (err) {
    alert(
      err?.response?.data?.message ||
      "Failed to create maintenance record."
    );
  }
};

  // Fetch maintenance records
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          search,
           maintenanceStatus: status, 
          page,
          limit: PAGE_SIZE,
        };
        const res = await getMaintenance(params);
        setRecords(res.maintenances || []);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load maintenance records.");
      } finally {
        console.log("fetchData done");
        setLoading(false);
      }
    };
    fetchData();
  }, [search, status, page, refreshing]
);
  

  // Mechanic assignment handler
  const handleAssignMechanic = async (maintenanceId, mechanicId) => {
    setAssigning(a => ({ ...a, [maintenanceId]: true }));
    try {
      await assignMechanic(maintenanceId, mechanicId);
      setRefreshing(r => !r);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to assign mechanic.");
    } finally {
      setAssigning(a => ({ ...a, [maintenanceId]: false }));
    }
  };

  // Status update handler
  const handleStatusChange = async (maintenanceId, newStatus) => {
    try {
      await updateMaintenanceStatus(
      maintenanceId,
      newStatus
   );
      setRefreshing(r => !r);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status.");
    }
  };

  // Fetch repair history for a maintenance record
  const fetchTimeline = async (maintenanceId) => {
  setTimelineData((d) => ({
    ...d,
    [maintenanceId]: {
      loading: true,
      error: "",
      history: [],
    },
  }));

  try {
    const res = await api.get(
  `/repair-history/${maintenanceId}`
);

    console.log(
      "TIMELINE RESPONSE:",
      res.data
    );

    setTimelineData((d) => ({
      ...d,
      [maintenanceId]: {
        loading: false,
        error: "",
        history: res.data || [],
      },
    }));
  } catch (err) {
    console.error("TIMELINE ERROR:", err);

    setTimelineData((d) => ({
      ...d,
      [maintenanceId]: {
        loading: false,
        error:
          err?.response?.data?.message ||
          "Failed to load timeline.",
        history: [],
      },
    }));
  }
};
  console.log("units", units);
  console.log("mechanics", mechanics);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Dashboard</h1>
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={e => {
            e.preventDefault();
            setPage(1);
            setRefreshing(r => !r);
          }}
        >

          {isAdmin && (
  <button
    type="button"
    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
    onClick={() => setOpenCreateModal(true)}
  >
    Create Maintenance
  </button>
)}
          <input
            type="text"
            placeholder="Search by unit, issue, mechanic..."
            className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full md:w-48"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full md:w-36"
            value={status}
            onChange={e => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="Pending">Pending</option>
            <option value="Diagnosed">Diagnosed</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting Parts">Waiting Parts</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button type="submit" className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-150 active:scale-95 shadow-sm flex items-center justify-center"><Search className="size-4" /></button>
          <button type="button" className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200/60 transition-all duration-150 active:scale-95 shadow-xs flex items-center justify-center" onClick={() => setRefreshing(r => !r)} title="Refresh"><RefreshCw className="size-4" /></button>
        </form>
      </div>
      <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm overflow-x-auto">
         {loading ? (
          <Loader />
        ) : error ? (
          <div className="text-red-600 text-center py-8 text-xs font-semibold">{error}</div>
        ) : (
          <table className="min-w-full table-auto border-collapse text-left text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60">
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Unit</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Issue</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Mechanic</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Reported</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Recurrence</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-medium italic">No maintenance records found.</td>
                </tr>
              ) : (
                records.map((rec) => (
                  <React.Fragment key={rec._id}>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/55 transition-colors duration-150 odd:bg-white even:bg-slate-50/20">
                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-800">{rec.unit?.plateNumber || rec.unit?.name || "-"}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">{rec.issueCategory} <span className="block text-slate-400 text-[10px] font-medium mt-0.5">{rec.issueDescription}</span></td>
                      <td className="px-5 py-3.5"><StatusBadge status={rec.maintenanceStatus} /></td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        {rec.assignedMechanic ? (
                           <span>
                                {rec.assignedMechanic?.fullName}
                          </span>
                    ) : (
                          <span className="text-[11px] font-medium text-slate-400 italic">Unassigned</span>
                    )}
                        {/* Mechanic assignment dropdown (admin only) */}
                        {isAdmin && (
                          <select
                            className="border border-slate-200/80 rounded-md px-1.5 py-0.5 text-[10px] bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 ml-2"
                            disabled={assigning[rec._id]}
                            value={rec.assignedMechanic?._id || ""}
                            onChange={e => handleAssignMechanic(rec._id, e.target.value)}
                          >
                            <option value="">Assign Mechanic</option>
                            {(rec.mechanicOptions || []).map(m => (
                              <option key={m._id} value={m._id}>{m.fullName || m.name}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{rec.createdAt ? new Date(rec.createdAt).toLocaleString() : "-"}</td>
                      <td className="px-5 py-3.5">
                        <RecurringBadge detected={rec.recurringIssueDetected} count={rec.recurringIssueCount}/>
                      </td>
                      <td className="px-5 py-3.5 flex flex-wrap gap-1 items-center">

                      {isAdmin && (

                       <select
                         className="border border-slate-200/80 rounded-md px-1.5 py-0.5 text-[10px] bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 mr-1"
                              value={rec.maintenanceStatus}
                             onChange={e => handleStatusChange(rec._id, e.target.value)}
                       >
                                <option value="Pending">Pending</option>
                                <option value="Diagnosed">Diagnosed</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Waiting Parts">Waiting Parts</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                 </select>
                           )}

                                 <button
                                 className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded border border-blue-200/60 transition-all duration-150 active:scale-95"
                                 onClick={() => handleViewDetails(rec)}
                                type="button"
                           >
                                    Details
                           </button>

                      {isAdmin && (
                     <button
                     className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold rounded border border-amber-200/60"
                    onClick={() => handleEdit(rec)}
                    >
                         Edit
                    </button>
                      )}

                         {isAdmin && rec.maintenanceStatus !== "Completed" && (
                       <button
                             className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200/60 transition-all duration-150 active:scale-95"
                            onClick={() =>
                           handleStatusChange(
                           rec._id,
                         "Completed"
                         )
                       }
                      type="button"
                    >
                        Done
                </button>
                   )}

                 <button
                className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold rounded border border-slate-200 transition-all duration-150 active:scale-95"
                onClick={() => fetchTimeline(rec._id)}
                  type="button"
               >
                  Timeline
              </button>

               </td>
                    </tr>
                    {/* Timeline row (expandable, simple for now) */}
                    {timelineData[rec._id] && (
                      <tr>
                        <td colSpan={7} className="bg-slate-50/50 p-4 border-b border-slate-100">
                          <MaintenanceTimeline
                            history={timelineData[rec._id].history}
                            loading={timelineData[rec._id].loading}
                            error={timelineData[rec._id].error}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        )}
        {/* Pagination */}
        <div className="flex justify-between items-center mt-5 border-t border-slate-100 pt-4">
          <div className="text-xs font-medium text-slate-500">Page {page} of {totalPages}</div>
          <div className="flex gap-1.5">
            <button className="px-3 py-1 text-xs font-semibold border rounded-lg transition-all duration-150 shadow-xs bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
            <button className="px-3 py-1 text-xs font-semibold border rounded-lg transition-all duration-150 shadow-xs bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
          
          </div>
        </div>
      </div>
      <MaintenanceDetailsModal
        open={!!selectedMaintenance}
        maintenance={selectedMaintenance}
        onClose={() => setSelectedMaintenance(null)}
        onUpdate={handleUpdateMaintenance}
      />
     
    {/* CREATE */}
{isAdmin && (
  <CreateMaintenanceModal
    open={openCreateModal}
    onClose={() => setOpenCreateModal(false)}
    onSubmit={handleCreateMaintenance}
    units={units}
    mechanics={mechanics}
  />
)}

{/* EDIT */}
{isAdmin && (
  <CreateMaintenanceModal
    open={!!editingMaintenance}
    onClose={() => setEditingMaintenance(null)}
    onSubmit={handleUpdateMaintenance}
    units={units}
    mechanics={mechanics}
    maintenance={editingMaintenance}
  />
)}


    </div>
  );
};

export default MaintenanceDashboard;
