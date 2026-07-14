import { useState } from "react";
import DriverTable from "../../components/drivers/DriverTable";
import DriverFormModal from "../../components/drivers/DriverFormModal";
import DriverDetailsModal from "../../components/drivers/DriverDetailsModal";
import DriverSearchBar from "../../components/drivers/DriverSearchBar";
import DriverPagination from "../../components/drivers/DriverPagination";

const DriverManagementPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 text-slate-800">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Driver Management</h1>
        <p className="text-xs text-slate-500 mt-1">Manage transport driver profiles, status updates, and credentials.</p>
      </div>
      <DriverSearchBar />
      <DriverTable 
        onShowDetails={driver => { setSelectedDriver(driver); setShowDetails(true); }}
        onAddDriver={() => setShowForm(true)}
      />
      <DriverPagination />
      <DriverFormModal open={showForm} onClose={() => setShowForm(false)} />
      <DriverDetailsModal open={showDetails} driver={selectedDriver} onClose={() => setShowDetails(false)} />
    </div>
  );
};

export default DriverManagementPage;
