import { useState } from "react";
import api from "../../lib/axios";

const DriverFormModal = ({ open, onClose, initialData }) => {
  const [form, setForm] = useState(
    initialData || {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      emergencyContact: { name: "", phone: "", relation: "" },
      licenseNumber: "",
      licenseType: "",
      licenseExpiry: "",
      status: "Active",
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Support nested fields using dot notation like 'emergencyContact.name'
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setForm((prev) => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Ensure payload matches backend schema exactly
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        middleName: form.middleName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        emergencyContact: {
          name: form.emergencyContact?.name || "",
          phone: form.emergencyContact?.phone || "",
          relation: form.emergencyContact?.relation || "",
        },
        licenseNumber: form.licenseNumber,
        licenseType: form.licenseType,
        licenseExpiry: form.licenseExpiry,
        status: form.status, // should be one of: Active, Inactive, Suspended
      };

      if (form._id) {
        await api.put(`/drivers/${form._id}`, payload);
      } else {
        await api.post(`/drivers`, payload);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save driver");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <form className="bg-white border border-slate-200/60 rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-150" onSubmit={handleSubmit}>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">{form._id ? "Edit Driver" : "Add Driver"}</h2>
        {error && <div className="text-rose-600 bg-rose-50 border border-rose-200/60 rounded-lg p-3 text-xs font-semibold mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">First Name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full" required />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Middle Name</label>
            <input name="middleName" value={form.middleName} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full" required />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full" required type="email" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full" required />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full" />
          </div>

          <div className="md:col-span-2">
            <fieldset className="border border-slate-200/60 rounded-xl p-4 bg-slate-50/25 mt-2">
              <legend className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Emergency Contact</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 text-slate-500 uppercase tracking-wider mb-1">Name</label>
                  <input name="emergencyContact.name" value={form.emergencyContact.name} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
                  <input name="emergencyContact.phone" value={form.emergencyContact.phone} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Relation</label>
                  <input name="emergencyContact.relation" value={form.emergencyContact.relation} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full" />
                </div>
              </div>
            </fieldset>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">License Number</label>
            <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full" required />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">License Type</label>
            <input name="licenseType" value={form.licenseType} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full" required />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">License Expiry</label>
            <input name="licenseExpiry" value={form.licenseExpiry} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full" type="date" required />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 border-t border-slate-100 pt-4">
          <button type="button" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200/60 transition-all duration-150 active:scale-95 shadow-xs" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 active:scale-95 hover:shadow-md" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </div>
  );
};

export default DriverFormModal;
