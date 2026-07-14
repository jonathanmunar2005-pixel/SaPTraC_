import { useEffect, useState } from "react";
import UnitTable from "../../components/units/UnitTable";
import UnitFormModal from "../../components/units/UnitFormModal";
import UnitDetailsModal from "../../components/units/UnitDetailsModal";
import useAuth from "../../lib/useAuth";
import api from "../../lib/axios";

const UnitManagementPage = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [query, setQuery] = useState({ search: "", availabilityStatus: "", maintenanceStatus: "", page: 1 });
  const [totalPages, setTotalPages] = useState(1);

  // Move fetchUnits to useEffect and define inside effect to avoid reference error
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = { ...query };
        const res = await api.get("/units", { params });
        setUnits(res.data.units || []);
        setTotalPages(res.data.totalPages || 1);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load units");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [query]);

  const handleAdd = () => {
    setSelectedUnit(null);
    setShowForm(true);
  };

  const handleEdit = (unit) => {
    setSelectedUnit(unit);
    setShowForm(true);
  };

  const handleDetails = (unit) => {
    setSelectedUnit(unit);
    setShowDetails(true);
  };

  const handleFormClose = (refresh) => {
    setShowForm(false);
    setSelectedUnit(null);
    if (refresh) {
      // Refetch units after closing form if needed
      setLoading(true);
      api.get("/units", { params: { ...query } })
        .then(res => {
          setUnits(res.data.units || []);
          setTotalPages(res.data.totalPages || 1);
          setError(null);
        })
        .catch(err => setError(err.response?.data?.message || "Failed to load units"))
        .finally(() => setLoading(false));
    }
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setSelectedUnit(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 text-slate-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Unit Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage transport fleet units, body numbers, route assignments, and maintenance status.</p>
        </div>
        {user?.role !== "Operational Manager" && (
          <button 
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 active:scale-95" 
            onClick={handleAdd}
          >
            Add Unit
          </button>
        )}
      </div>
      <UnitTable
        units={units}
        loading={loading}
        error={error}
        query={query}
        setQuery={setQuery}
        totalPages={totalPages}
        onEdit={handleEdit}
        onShowDetails={handleDetails}
      />
      {showForm && (
        <UnitFormModal
          open={showForm}
          unit={selectedUnit}
          onClose={handleFormClose}
        />
      )}
      {showDetails && (
        <UnitDetailsModal
          open={showDetails}
          unit={selectedUnit}
          onClose={handleDetailsClose}
        />
      )}
    </div>
  );
};

export default UnitManagementPage;
