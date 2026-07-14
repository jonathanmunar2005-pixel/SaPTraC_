import { useEffect, useState, useRef, useMemo } from "react";
import { useAnalyticsApi } from "../../lib/analyticsApi";
import KPIGrid from "../../components/analytics/KPIGrid";
import { TrendingUp, Wallet, Fuel, Users, Truck, Wrench } from "lucide-react";
import RevenueChart from "../../components/analytics/RevenueChart";
import { getSocket } from "../../lib/socket";

const kpiConfig = [
	{
		key: "totalRevenue",
		label: "Total Revenue",
		icon: <TrendingUp />,
		currency: true,
		animate: true,
	},
	{
		key: "totalRemittance",
		label: "Total Remittance",
		icon: <Wallet />,
		currency: true,
		animate: true,
	},
	{
		key: "totalFuelCost",
		label: "Fuel Expenses",
		icon: <Fuel />,
		currency: true,
		animate: true,
	},
	{
		key: "activeDrivers",
		label: "Active Drivers",
		icon: <Users />,
		animate: true,
	},
	{
		key: "activeUnits",
		label: "Active Units",
		icon: <Truck />,
		animate: true,
	},
	{
		key: "maintenanceIncidents",
		label: "Maintenance Incidents",
		icon: <Wrench />,
		animate: true,
	},
];

const AnalyticsDashboard = () => {
	// State for analytics data
	const [dashboard, setDashboard] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filters, setFilters] = useState({
		startDate: "",
		endDate: "",
		month: "",
		year: "",
	});

	const { getDashboardSummary } = useAnalyticsApi();

	// refs for debounce/abort
	const debounceRef = useRef(null);
	const abortRef = useRef(null);

	// Fetch dashboard analytics when filters change.
	// Debounced + cancellable to prevent duplicate requests.
	useEffect(() => {
		// helper: sleep
		const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

		// helper: fetch with limited retries (handles 429)
		const fetchWithRetries = async (params, signal, attempts = 3, delay = 500) => {
			try {
				return await getDashboardSummary(params, { signal });
			} catch (err) {
				if (signal && signal.aborted) throw err;
				const status = err?.response?.status;
				if ((status === 429 || status >= 500) && attempts > 0) {
					// exponential backoff
					await sleep(delay);
					return fetchWithRetries(params, signal, attempts - 1, Math.min(2000, delay * 2));
				}
				throw err;
			}
		};

		// clear previous debounce
		if (debounceRef.current) clearTimeout(debounceRef.current);

		// abort any in-flight request
		if (abortRef.current) {
			try {
				abortRef.current.abort();
			} catch {
				// ignore
			}
		}

		const controller = new AbortController();
		abortRef.current = controller;

		debounceRef.current = setTimeout(async () => {
			setLoading(true);
			setError("");
			try {
				const data = await fetchWithRetries(filters, controller.signal);
           console.log("Analytics Response:", data);
         if (!controller.signal.aborted) {
            setDashboard(data);
			console.log("setDashboard:", data);
            }
			} catch (err) {
				if (!controller.signal.aborted) {
					const status = err?.response?.status;
					if (status === 429) {
						setError("Rate limit exceeded. Please wait a moment and try again.");
					} else {
						setError(err?.response?.data?.message || err?.message || "Failed to load analytics dashboard");
					}
				}
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		}, 300); // short debounce for filters

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
			controller.abort();
		};
	}, [filters, getDashboardSummary]);

	useEffect(() => {
           console.log("Dashboard State:", dashboard);
          }, [dashboard]);

	// Real-time socket listeners (stable, cleaned up on unmount)
	useEffect(() => {
		const socket = getSocket();

		const onDashboardUpdate = (data) => {
			setDashboard((prev) => ({ ...(prev || {}), ...data }));
		};

		const onMaintenanceUpdate = (data) => {
			setDashboard((prev) => ({ ...(prev || {}), maintenanceIncidents: data.count }));
		};

		const onFuelUpdate = (data) => {
			setDashboard((prev) => ({ ...(prev || {}), totalFuelCost: data.totalFuelCost }));
		};

		const onRemittanceUpdate = (data) => {
			setDashboard((prev) => ({ ...(prev || {}), totalRemittance: data.totalRemittance }));
		};

		const onConnect = () => {
			console.info("Socket connected");
		};

		const onDisconnect = (reason) => {
			console.info("Socket disconnected:", reason);
		};

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		socket.on("dashboardUpdate", onDashboardUpdate);
		socket.on("maintenanceUpdate", onMaintenanceUpdate);
		socket.on("fuelAnalyticsUpdate", onFuelUpdate);
		socket.on("remittanceUpdate", onRemittanceUpdate);

		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("dashboardUpdate", onDashboardUpdate);
			socket.off("maintenanceUpdate", onMaintenanceUpdate);
			socket.off("fuelAnalyticsUpdate", onFuelUpdate);
			socket.off("remittanceUpdate", onRemittanceUpdate);
		};
	}, []);

	// Handle filter changes
	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	};

	// Memoize KPI preparation so KPIGrid doesn't re-render unnecessarily
	const kpis = [
  {
    key: "totalRevenue",
    kpiKey: "totalRevenue",
    label: "Total Revenue",
    kpiLabel: "Total Revenue",
    icon: <TrendingUp />,
    currency: true,
    value: dashboard?.totalRevenue || 0,
  },
  {
    key: "totalRemittance",
    kpiKey: "totalRemittance",
    label: "Total Remittance",
    kpiLabel: "Total Remittance",
    icon: <Wallet />,
    currency: true,
    value: dashboard?.totalRemittance || 0,
  },
  {
    key: "totalFuelCost",
    kpiKey: "totalFuelCost",
    label: "Fuel Expenses",
    kpiLabel: "Fuel Expenses",
    icon: <Fuel />,
    currency: true,
    value: dashboard?.totalFuelCost || 0,
  },
  {
    key: "activeDrivers",
    kpiKey: "activeDrivers",
    label: "Active Drivers",
    kpiLabel: "Active Drivers",
    icon: <Users />,
    value: dashboard?.activeDrivers || 0,
  },
  {
    key: "activeUnits",
    kpiKey: "activeUnits",
    label: "Active Units",
    kpiLabel: "Active Units",
    icon: <Truck />,
    value: dashboard?.activeUnits || 0,
  },
  {
    key: "maintenanceIncidents",
    kpiKey: "maintenanceIncidents",
    label: "Maintenance Incidents",
    kpiLabel: "Maintenance Incidents",
    icon: <Wrench />,
    value: dashboard?.maintenanceIncidents || 0,
  },
];

useEffect(() => {
  console.log("Dashboard State:", dashboard);
  console.log("KPIs:", kpis);
}, [dashboard, kpis]);

	return (
		<div className="min-h-screen bg-slate-50 p-6 md:p-8 text-slate-800">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
				<p className="text-xs text-slate-500 mt-1">Monitor cooperative revenue, remittances, fuel consumption, and fleet metrics.</p>
			</div>

			{/* Filters */}
			<div className="bg-white border border-slate-200/60 rounded-xl p-4 mb-6 shadow-sm flex flex-wrap gap-4 items-end">
				<div className="flex-1 min-w-[200px] md:flex-none">
					<label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
					<input
						type="date"
						name="startDate"
						value={filters.startDate}
						onChange={handleFilterChange}
						className="w-full border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
					/>
				</div>
				<div className="flex-1 min-w-[200px] md:flex-none">
					<label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
					<input
						type="date"
						name="endDate"
						value={filters.endDate}
						onChange={handleFilterChange}
						className="w-full border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
					/>
				</div>
				<div className="flex-1 min-w-[150px] md:flex-none">
					<label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Month</label>
					<select
						name="month"
						value={filters.month}
						onChange={handleFilterChange}
						className="w-full border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
					>
						<option value="">All Months</option>
						{[...Array(12)].map((_, i) => (
							<option key={i + 1} value={i + 1}>
								{new Date(0, i).toLocaleString("default", {
									month: "long",
								})}
							</option>
						))}
					</select>
				</div>
				<div className="flex-1 min-w-[120px] md:flex-none">
					<label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Year</label>
					<input
						type="number"
						name="year"
						min="2000"
						max={new Date().getFullYear()}
						value={filters.year}
						onChange={handleFilterChange}
						className="w-full border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
						placeholder="Year"
					/>
				</div>
			</div>

			{/* Error State */}
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-center text-xs font-semibold shadow-sm">
					{error}
				</div>
			)}

			{/* KPI Cards Grid */}
			<KPIGrid kpis={kpis} loading={loading} />

			{/* Charts Section */}
			<div className="bg-white border border-slate-200/60 rounded-xl p-5 mt-6 shadow-sm">
				<h2 className="text-xs font-bold text-slate-500 tracking-wider mb-4 uppercase">Revenue Analytics</h2>
				<RevenueChart filters={filters} />
			</div>

			{/* Realtime Statistics Section (placeholder) */}
			<div className="bg-white border border-slate-200/60 rounded-xl p-5 mt-6 shadow-sm">
				<h2 className="text-xs font-bold text-slate-500 tracking-wider mb-4 uppercase">Realtime Statistics</h2>
				{/* Realtime stats will go here */}
				<div className="text-slate-400 text-center py-12 text-xs font-medium border border-dashed border-slate-200/80 rounded-xl bg-slate-50/50 mt-2">
					[Realtime statistics coming soon]
				</div>
			</div>
		</div>
	);
};

export default AnalyticsDashboard;
