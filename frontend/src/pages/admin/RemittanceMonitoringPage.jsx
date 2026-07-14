import { useEffect, useState } from "react";
import { useRemittanceApi } from "../../lib/remittanceApi";
import { AlertCircle, CheckCircle, RefreshCw, Search } from "lucide-react";
import { useDriverApi } from "../../lib/driverApi";
import { useUnitApi } from "../../lib/unitApi";

const PAGE_SIZE = 10;

const NegativeBalanceBadge = () => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold border border-red-200 ml-2">
    <AlertCircle className="mr-1 size-3" /> Negative Balance
  </span>
);

const RemittanceTable = ({ remittances, loading, error, onVerify, page, totalPages, onPageChange }) => (
  <div className="overflow-x-auto bg-white border border-slate-200/60 rounded-xl shadow-sm mt-4">
    <table className="min-w-full table-auto border-collapse text-left">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200/60">
          <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">#</th>
          <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Driver</th>
          <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Route</th>
          <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit</th>
          <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
          <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
          <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
          <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={7} className="p-0">
              <div className="animate-pulse space-y-3.5 p-5 bg-white">
                <div className="h-9 bg-slate-100 rounded"></div>
                <div className="h-9 bg-slate-100 rounded"></div>
                <div className="h-9 bg-slate-100 rounded"></div>
                <div className="h-9 bg-slate-100 rounded"></div>
              </div>
            </td>
          </tr>
        ) : error ? (
          <tr>
            <td colSpan={7} className="p-5">
              <div className="bg-rose-50 border border-rose-200/60 text-rose-600 rounded-lg p-6 text-center text-xs font-semibold shadow-sm">
                {error}
              </div>
            </td>
          </tr>
        ) : remittances.length === 0 ? (
          <tr>
            <td colSpan={7} className="py-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">No Remittances</h3>
                <p className="text-[11px] text-slate-400 mt-1">There are no remittance records matching your filters.</p>
              </div>
            </td>
          </tr>
        ) : remittances.map((r, idx) => (
          <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50/55 transition-colors duration-150 odd:bg-white even:bg-slate-50/20">
            <td className="px-5 py-3 text-xs text-slate-500 font-semibold">{(page - 1) * PAGE_SIZE + idx + 1}</td>
            <td className="px-5 py-3 text-xs font-semibold text-slate-800">
  {r.driver ? `${r.driver.firstName} ${ r.driver.middleName ? r.driver.middleName + " " : ""  }${r.driver.lastName}` : "-"}</td>
  <td className="px-5 py-3 text-xs text-slate-700 font-medium">{r.route || "-"}</td>
  <td className="px-5 py-3 text-xs font-semibold text-slate-800">{r.unit?.plateNumber || "-"}</td>
  <td className="px-5 py-3 text-xs text-slate-900 font-bold whitespace-nowrap">₱{r.amount?.toLocaleString()}
   {r.hasNegativeBalance && <NegativeBalanceBadge />}
  </td>
            <td className="px-5 py-3 text-xs text-slate-600">{new Date(r.transactionDate).toLocaleDateString()}</td>
            <td className="px-5 py-3 text-xs">
              {r.verified ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle className="mr-1.5 size-3.5" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                  <RefreshCw className="mr-1.5 size-3 animate-spin" style={{ animationDuration: '3s' }} /> Pending
                </span>
              )}
            </td>
            <td className="px-5 py-3 text-xs text-right">
              {!r.verified && (
                <button
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-sm transition-all duration-150 active:scale-95 hover:shadow-md"
                  onClick={() => onVerify(r._id)}
                >
                  Verify
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {/* Pagination */}
    <div className="flex justify-between items-center px-5 py-4 border-t border-slate-100 bg-slate-50/50">
      <div className="text-xs font-medium text-slate-500">Page {page} of {totalPages || 1}</div>
      <div className="flex gap-1.5">
        <button
          className="px-3 py-1 text-xs font-semibold border rounded-lg transition-all duration-150 shadow-xs bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none active:scale-95"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          Prev
        </button>
        <button
          className="px-3 py-1 text-xs font-semibold border rounded-lg transition-all duration-150 shadow-xs bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none active:scale-95"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  </div>
);

const RemittanceFormModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  drivers,
  units
})=> {
  const [form, setForm] = useState({driver: "", unit: "", route: "", amount: "", transactionDate: ""});
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if ( !form.driver || !form.unit || !form.route || !form.amount || !form.transactionDate) {
      setError("All fields are required.");
      return;
    }
    setError("");
    onSubmit(form);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-150">
        <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold transition-colors" onClick={onClose}>&times;</button>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 pb-2 border-b border-slate-100">Create Remittance</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Driver ID</label>
            <select
  name="driver"
  value={form.driver}
  onChange={handleChange}
  className="
    w-full
    border border-slate-300
    rounded-lg
    px-3 py-2
    bg-white
    text-slate-700
    text-sm
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500
    appearance-none
  "
>
          <option value="">Select Driver</option>

       {drivers.map(driver => (
       <option key={driver._id} value={driver._id}>
       {driver.firstName} {driver.lastName}
        </option>
        ))}
       </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unit ID</label>
           <select
  name="unit"
  value={form.unit}
  onChange={handleChange}
  className="
    w-full
    border border-slate-300
    rounded-lg
    px-3 py-2
    bg-white
    text-slate-700
    text-sm
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500
    appearance-none
  "
>
           <option value="">Select Unit</option>

           {units.map(unit => (
           <option key={unit._id} value={unit._id}>
            {unit.bodyNumber}
           </option>
          ))}
         </select>
            <div>
  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
    Route
  </label>

  <select
  name="route"
  value={form.route}
  onChange={handleChange}
  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
  <option value="">Select Route</option>
  <option value="Langgam">Langgam</option>
  <option value="Villarosa">Villarosa</option>
  <option value="Bayan-Bayanan">Bayan-Bayanan</option>
  <option value="Estrella">Estrella</option>
  <option value="Calamba">Calamba</option>
</select>
</div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amount</label>
            <input 
              name="amount" 
              type="number" 
              className="w-full border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150" 
              placeholder="Amount" 
              value={form.amount} 
              onChange={handleChange} 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Transaction Date</label>
            <input 
              name="transactionDate" 
              type="date" 
              className="w-full border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150" 
              value={form.transactionDate} 
              onChange={handleChange} 
            />
          </div>
          {error && <div className="text-rose-600 bg-rose-50 border border-rose-200/60 rounded-lg p-3 text-xs font-semibold">{error}</div>}
          <button 
            type="submit" 
            className="w-full px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 active:scale-95 hover:shadow-md mt-2" 
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
};

const RemittanceMonitoringPage = () => {
  const { getDriversDropdown } = useDriverApi();
  const { getUnits } = useUnitApi();
  const [drivers, setDrivers] = useState([]);
  const [units, setUnits] = useState([]);
  const { getRemittances, createRemittance, verifyRemittance } = useRemittanceApi();
  const [remittances, setRemittances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ status: "", negative: "" });
  const [creating, setCreating] = useState(false);
   
      useEffect(() => {
     fetchDropdowns();
     }, []);

     const fetchDropdowns = async () => {
    try {
    const driverRes = await getDriversDropdown();

    const unitRes = await getUnits({
      page: 1,
      limit: 1000,
    });

    setDrivers(driverRes.drivers || []);
    setUnits(unitRes.units || []);
  } catch (err) {
    console.log(err);
  }
};


  const fetchRemittances = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        search,
        status: filter.status,
        negative: filter.negative,
      };
      const res = await getRemittances(params);
      setRemittances(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load remittances.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchRemittances();
    })();
    // eslint-disable-next-line
  }, [page, search, filter]);

  const handleVerify = async (id) => {
    if (!window.confirm("Verify this remittance?")) return;
    try {
      await verifyRemittance(id);
      fetchRemittances();
    } catch {
      alert("Verification failed.");
    }
  };

  const handleCreate = async (form) => {
    setCreating(true);
    try {
      await createRemittance(form);
      setShowForm(false);
      fetchRemittances();
    } catch {
      alert("Failed to create remittance.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Remittance Monitoring</h1>
          <p className="text-xs text-slate-500 mt-1">Track cooperative daily remittance records, driver payments, and verification status.</p>
        </div>
        <button
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 active:scale-95"
          onClick={() => setShowForm(true)}
        >
          + Create Remittance
        </button>
      </div>
      {/* Search & Filter */}
      <div className="bg-white border border-slate-200/60 rounded-xl p-4 mb-6 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex items-center border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-150">
          <Search className="text-slate-400 mr-2 size-3.5" />
          <input
            className="outline-none bg-transparent w-40 text-xs text-slate-800"
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 min-w-[140px]"
          value={filter.status}
          onChange={e => { setFilter(f => ({ ...f, status: e.target.value })); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
        </select>
        <select
          className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 min-w-[140px]"
          value={filter.negative}
          onChange={e => { setFilter(f => ({ ...f, negative: e.target.value })); setPage(1); }}
        >
          <option value="">All Balances</option>
          <option value="true">Negative Only</option>
        </select>
      </div>
      {/* Table */}
      <RemittanceTable
        remittances={remittances}
        loading={loading}
        error={error}
        onVerify={handleVerify}
        page={page}
        totalPages={totalPages}
        onPageChange={p => setPage(p)}
      />
      {/* Create Modal */}
      <RemittanceFormModal
  open={showForm}
  onClose={() => setShowForm(false)}
  onSubmit={handleCreate}
  loading={creating}
  drivers={drivers}
  units={units}
/>
    </div>
  );
};

export default RemittanceMonitoringPage;
