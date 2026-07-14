import { useState, useEffect } from "react";

const CreateMaintenanceModal = ({
  open,
  onClose,
  onSubmit,
  units = [],
  mechanics = [],
  maintenance = null,
})=> {
 
useEffect(() => {
  if (maintenance) {
    setForm({
      unit: maintenance.unit?._id || "",
      assignedMechanic: maintenance.assignedMechanic?._id || "",
      issueTitle: maintenance.issueTitle || "",
      issueDescription: maintenance.issueDescription || "",
      priorityLevel: maintenance.priorityLevel || "Medium",
      maintenanceType: maintenance.maintenanceType || "Corrective",
    });
  } else {
    setForm({
      unit: "",
      assignedMechanic: "",
      issueTitle: "",
      issueDescription: "",
      priorityLevel: "Medium",
      maintenanceType: "Corrective",
    });
  }
}, [maintenance, open]);

  const [form, setForm] = useState({
  unit: "",
  assignedMechanic: "",
  issueTitle: "",
  issueDescription: "",
  priorityLevel: "Medium",
  maintenanceType: "Corrective",
});

  if (!open) return null;

  const handleSubmit = (e) => {
  e.preventDefault();

onSubmit(form);
};

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/45 backdrop-blur-xs">
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95 duration-150">

        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Create Maintenance Record
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">

          <select
            className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
            value={form.unit}
            onChange={(e) =>
              setForm({
                ...form,
                unit: e.target.value,
              })
            }
          >
            <option value="">Select Unit</option>

            {units.map((u) => (
              <option
                key={u._id}
                value={u._id}
              >
                {u.plateNumber}
              </option>
            ))}
          </select>

          <select
            className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
            value={form.assignedMechanic}
            onChange={(e) =>
              setForm({
                ...form,
                assignedMechanic: e.target.value,
              })
            }
          >
            <option value="">Assign Mechanic</option>

            {mechanics.map((m) => (
              <option
                key={m._id}
                value={m._id}
              >
                {m.fullName}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Issue Title"
            className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
            value={form.issueTitle}
            onChange={(e) =>
              setForm({
                ...form,
                issueTitle: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Issue Description"
            className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full min-h-[80px]"
            value={form.issueDescription}
            onChange={(e) =>
              setForm({
                ...form,
                issueDescription: e.target.value,
              })
            }
          />
          
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <select
  className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-32"
  value={form.priorityLevel}
  onChange={(e) =>
    setForm({
      ...form,
      priorityLevel: e.target.value,
    })
  }
>
  <option value="Low">Low</option>
  <option value="Medium">Medium</option>
  <option value="High">High</option>
  <option value="Critical">Critical</option>
</select>

<select
  className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-32"
  value={form.maintenanceType}
  onChange={(e) =>
    setForm({
      ...form,
      maintenanceType: e.target.value,
    })
  }
>
  <option value="Preventive">Preventive</option>
  <option value="Corrective">Corrective</option>
  <option value="Emergency">Emergency</option>
</select>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200/60 transition-all duration-150 active:scale-95 shadow-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all duration-150 active:scale-95 shadow-sm"
            >
              Create
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateMaintenanceModal;