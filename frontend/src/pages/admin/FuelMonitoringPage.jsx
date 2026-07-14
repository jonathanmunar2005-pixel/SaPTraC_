import { useEffect, useState } from "react";
import { useFuelApi } from "../../lib/fuelApi";
import QRScanner from "../../components/fuel/QRScanner";
import FuelAlertNotification from "../../components/fuel/FuelAlertNotification";
import useAuth from "../../lib/useAuth";
import toast from "react-hot-toast";

const shiftTypes = ["First Shift", "Second Shift"];

const AnomalyBadge = ({ detected, reason }) =>
  detected ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200" title={reason || "Anomaly detected"}>
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />
      Anomaly
    </span>
  ) : null;

const FuelMonitoringPage = () => {
  const { getFuelTransactions, createFuelTransaction } = useFuelApi();
  const { user } = useAuth();

  // Table state
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({});

  // Form state
  const [form, setForm] = useState({
    driver: "",
    unit: "",
    qrCodeData: "",
    fuelLiters: "",
    fuelCost: "",
    odometerIn: "",
    odometerOut: "",
    fuelStation: "",
    shiftType: "First Shift",
    transactionDate: "",
    remarks: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [showQR, setShowQR] = useState(null); // 'driver' or 'unit'

  // Fetch transactions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          page,
          limit,
          search,
          ...filter,
        };
         const res = await getFuelTransactions(params);

console.log("FUEL API RESPONSE:", res);

setTransactions(
  res?.transactions ||
  res?.data?.transactions ||
  []
);

setTotal(
  res?.total ||
  res?.data?.total ||
  0
);
      } catch (err) {
        setError(err?.message || "Failed to load fuel transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [page, limit, search, filter]);

  // Handle form input
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle QR scan
  const handleQRSuccess = (data) => {
    if (showQR === "driver") {
      setForm((prev) => ({ ...prev, driver: data._id, qrCodeData: data.qrCodeData || "" }));
    } else if (showQR === "unit") {
      setForm((prev) => ({ ...prev, unit: data._id, qrCodeData: data.qrCodeData || "" }));
    }
    setShowQR(null);
  };

  // Handle form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const payload = {
        ...form,
        fuelLiters: Number(form.fuelLiters),
        fuelCost: Number(form.fuelCost),
        odometerIn: Number(form.odometerIn),
        odometerOut: form.odometerOut ? Number(form.odometerOut) : undefined,
        transactionDate: form.transactionDate,
      };
      await createFuelTransaction(payload);
      toast.success("Fuel transaction created");
      setForm({
        driver: "",
        unit: "",
        qrCodeData: "",
        fuelLiters: "",
        fuelCost: "",
        odometerIn: "",
        odometerOut: "",
        fuelStation: "",
        shiftType: "First Shift",
        transactionDate: "",
        remarks: "",
      });
      setPage(1);
      // Refresh table
      const res = await getFuelTransactions({
  page: 1,
  limit,
  search,
  ...filter,
});

console.log("REFRESH RESPONSE:", res);

setTransactions(
  res?.transactions ||
  res?.data?.transactions ||
  []
);

setTotal(
  res?.total ||
  res?.data?.total ||
  0
);
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || "Failed to create transaction");
    } finally {
      setFormLoading(false);
    }
  };

  // Pagination controls
  const totalPages = Math.ceil(total / limit);
  console.log("TRANSACTIONS:", transactions);
  console.log("FIRST TX:", transactions?.[0]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 text-slate-800">
      <FuelAlertNotification user={user} role={user?.role} />
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fuel Monitoring</h1>
          <p className="text-xs text-slate-500 mt-1">Track fuel logs, consumption transactions, and detect fuel anomalies.</p>
        </div>
      </div>

      {/* Dashboard Controls */}
      <div className="bg-white border border-slate-200/60 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form className="flex flex-wrap items-center gap-3" onSubmit={(e) => { e.preventDefault(); setPage(1); }}>
          <input
            type="text"
            placeholder="Search by driver/unit/station..."
            className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 flex-1 min-w-[200px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 min-w-[150px]"
            value={filter.shiftType || ""}
            onChange={(e) => setFilter((f) => ({ ...f, shiftType: e.target.value || undefined }))}
          >
            <option value="">All Shifts</option>
            {shiftTypes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="submit" className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 active:scale-95">Search</button>
        </form>
        <div className="flex gap-2">
          <button 
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 active:scale-95" 
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          >
            + New Transaction
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Fuel Transaction History</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="animate-pulse space-y-3.5 p-5 bg-white">
              <div className="h-9 bg-slate-100 rounded"></div>
              <div className="h-9 bg-slate-100 rounded"></div>
              <div className="h-9 bg-slate-100 rounded"></div>
              <div className="h-9 bg-slate-100 rounded"></div>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200/60 text-rose-600 rounded-lg p-6 text-center text-xs font-semibold m-5 shadow-sm">
              {error}
            </div>
          ) : (
            <table className="min-w-full table-auto border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60">
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Driver</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Liters</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cost</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Odo In</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Odo Out</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Station</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shift</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Anomaly</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 text-slate-350 text-slate-350 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">No Fuel Transactions</h3>
                        <p className="text-[11px] text-slate-400 mt-1">There are no fuel transaction logs matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="border-b border-slate-100 hover:bg-slate-50/55 transition-colors duration-150 odd:bg-white even:bg-slate-50/20">
                      <td className="px-5 py-3 text-xs text-slate-600 whitespace-nowrap">{tx.transactionDate ? new Date(tx.transactionDate).toLocaleString() : "-"}</td>
                      <td className="px-5 py-3 text-xs font-semibold text-slate-800 whitespace-nowrap">{tx.driver ? `${tx.driver.firstName || ""} ${tx.driver.lastName || ""}` : "-"} </td>
                      <td className="px-5 py-3 text-xs font-semibold text-slate-800 whitespace-nowrap">{tx.unit?.plateNumber || tx.unit?.bodyNumber || "-"} </td>
                      <td className="px-5 py-3 text-xs text-slate-600">{tx.fuelLiters}</td>
                      <td className="px-5 py-3 text-xs text-slate-600 font-semibold">{tx.fuelCost ? `₱${tx.fuelCost.toLocaleString()}` : "-"}</td>
                      <td className="px-5 py-3 text-xs text-slate-500">{tx.odometerIn}</td>
                      <td className="px-5 py-3 text-xs text-slate-500">{tx.odometerOut ?? "-"}</td>
                      <td className="px-5 py-3 text-xs text-slate-600 whitespace-nowrap">{tx.fuelStation}</td>
                      <td className="px-5 py-3 text-xs text-slate-600">{tx.shiftType}</td>
                      <td className="px-5 py-3 text-xs"><AnomalyBadge detected={tx.anomalyDetected} reason={tx.anomalyReason} /></td>
                      <td className="px-5 py-3 text-xs text-slate-500 max-w-[150px] truncate" title={tx.remarks}>{tx.remarks || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-5">
        <div className="text-xs font-medium text-slate-500">Page {page} of {totalPages || 1}</div>
        <div className="flex gap-1.5">
          <button 
            className="px-3 py-1 text-xs font-semibold border rounded-lg transition-all duration-150 shadow-xs bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none active:scale-95" 
            disabled={page === 1} 
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button 
            className="px-3 py-1 text-xs font-semibold border rounded-lg transition-all duration-150 shadow-xs bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none active:scale-95" 
            disabled={page === totalPages || totalPages === 0} 
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {/* Create Form */}
      <div className="mt-10 bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 pb-2 border-b border-slate-100">New Fuel Transaction</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleFormSubmit}>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Driver ID</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                name="driver"
                placeholder="Driver ID"
                className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
                value={form.driver}
                onChange={handleFormChange}
                required
              />
              <button 
                type="button" 
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200/60 shadow-xs transition-all duration-150 active:scale-95" 
                onClick={() => setShowQR("driver")}
              >
                Scan
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unit ID</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                name="unit"
                placeholder="Unit ID"
                className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
                value={form.unit}
                onChange={handleFormChange}
                required
              />
              <button 
                type="button" 
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200/60 shadow-xs transition-all duration-150 active:scale-95" 
                onClick={() => setShowQR("unit")}
              >
                Scan
              </button>
            </div>
          </div>

        

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fuel Station</label>
            <input
              type="text"
              name="fuelStation"
              placeholder="Fuel Station"
              className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
              value={form.fuelStation}
              onChange={handleFormChange}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fuel Liters</label>
            <input
              type="number"
              name="fuelLiters"
              placeholder="Fuel Liters"
              className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
              value={form.fuelLiters}
              onChange={handleFormChange}
              min={0}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fuel Cost</label>
            <input
              type="number"
              name="fuelCost"
              placeholder="Fuel Cost"
              className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
              value={form.fuelCost}
              onChange={handleFormChange}
              min={0}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Odometer In</label>
            <input
              type="number"
              name="odometerIn"
              placeholder="Odometer In"
              className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
              value={form.odometerIn}
              onChange={handleFormChange}
              min={0}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Odometer Out</label>
            <input
              type="number"
              name="odometerOut"
              placeholder="Odometer Out (optional)"
              className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
              value={form.odometerOut}
              onChange={handleFormChange}
              min={0}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Shift Type</label>
            <select
              name="shiftType"
              className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
              value={form.shiftType}
              onChange={handleFormChange}
              required
            >
              {shiftTypes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Transaction Date</label>
            <input
              type="datetime-local"
              name="transactionDate"
              className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
              value={form.transactionDate}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Remarks</label>
            <input
              type="text"
              name="remarks"
              placeholder="Remarks"
              className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
              value={form.remarks}
              onChange={handleFormChange}
            />
          </div>

          <div className="md:col-span-2 flex gap-2 mt-2 items-center">
            <button 
              type="submit" 
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 active:scale-95 hover:shadow-md" 
              disabled={formLoading}
            >
              Submit
            </button>
            {formLoading && <span className="text-xs text-slate-500 ml-2 font-medium">Saving...</span>}
            {formError && <span className="text-xs text-red-500 ml-2 font-semibold">{formError}</span>}
          </div>
        </form>
      </div>
      {/* QR Scanner Modal */}
      {showQR && (
        <QRScanner
          type={showQR}
          onScanSuccess={handleQRSuccess}
          onClose={() => setShowQR(null)}
        />
      )}
    </div>
  );
};

export default FuelMonitoringPage;
