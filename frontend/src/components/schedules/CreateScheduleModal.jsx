import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useScheduleApi } from '../../lib/scheduleApi';

const shiftMap = {
  'First Shift': { shiftStart: '05:00', shiftEnd: '13:00' },
  'Second Shift': { shiftStart: '13:00', shiftEnd: '21:00' },
};

const CreateScheduleModal = ({ isOpen, onClose, drivers = [], units = [], onSuccess }) => {
  const { createSchedule } = useScheduleApi();
  const [form, setForm] = useState({
    shiftDate: '',
    unit: '',
    driver: '',
    shiftType: 'First Shift',
    route: '',
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    // reset form when opened
    setForm({ shiftDate: '', unit: '', driver: '', shiftType: 'First Shift', route: '', remarks: '' });
    setErrors({});
    setSubmitting(false);
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const err = {};
    if (!form.shiftDate) err.shiftDate = 'Shift date is required';
    if (!form.unit) err.unit = 'Unit is required';
    if (!form.driver) err.driver = 'Driver is required';
    if (!form.shiftType) err.shiftType = 'Shift type is required';
    if (!form.route) err.route = 'Route is required';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const times = shiftMap[form.shiftType] || shiftMap['First Shift'];

    const payload = {
      driver: form.driver,
      unit: form.unit,
      shiftDate: form.shiftDate,
      shiftType: form.shiftType,
      shiftStart: times.shiftStart,
      shiftEnd: times.shiftEnd,
      route: form.route,
      remarks: form.remarks,
    };

    setSubmitting(true);
    try {
      const res = await createSchedule(payload);
      onSuccess && onSuccess(res);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Failed to create schedule';
      setErrors(prev => ({ ...prev, submit: message }));
      // Preserve existing conflict behavior; backend will return conflict error and API layer will surface it
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs">
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Create Schedule</h2>
          <button className="text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors duration-150" onClick={onClose}>Close</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Shift Date</label>
              <input type="date" name="shiftDate" value={form.shiftDate} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full" />
              {errors.shiftDate && <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.shiftDate}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Shift Type</label>
              <select name="shiftType" value={form.shiftType} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full">
                <option>First Shift</option>
                <option>Second Shift</option>
              </select>
              {errors.shiftType && <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.shiftType}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unit</label>
              <select name="unit" value={form.unit} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full">
                <option value="">Select unit</option>
                {units.map(u => (
                  <option key={u._id} value={u._id}>{u.plateNumber || u.bodyNumber}</option>
                ))}
              </select>
              {errors.unit && <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.unit}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Driver</label>
              <select name="driver" value={form.driver} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full">
                <option value="">Select driver</option>
                {drivers.map(d => (
                  <option key={d._id} value={d._id}>{`${d.firstName} ${d.lastName}`}</option>
                ))}
              </select>
              {errors.driver && <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.driver}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Route</label>
              <input type="text" name="route" value={form.route} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full" />
              {errors.route && <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.route}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Remarks</label>
              <textarea name="remarks" value={form.remarks} onChange={handleChange} className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full min-h-[80px]" />
            </div>
          </div>

          {errors.submit && <div className="text-xs font-semibold text-red-500 mt-3">{errors.submit}</div>}

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200/60 transition-all duration-150 active:scale-95 shadow-xs disabled:opacity-50" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all duration-150 active:scale-95 shadow-sm disabled:opacity-50" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateScheduleModal;
