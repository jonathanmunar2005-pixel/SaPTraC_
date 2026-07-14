import api from "./axios";
import useAuth from "./useAuth";

// Maintenance API integration layer
export const useMaintenanceApi = () => {
  useAuth(); // Ensures auth context is available

  // Get all maintenance records (with optional query params)
  const getMaintenance = async (params = {}) => {
    const res = await api.get("/maintenance", { params });
    return res.data;
  };

  // Get a single maintenance record by ID
  const getSingleMaintenance = async (maintenanceId) => {
    const res = await api.get(`/maintenance/${maintenanceId}`);
    return res.data;
  };

  // Create a new maintenance record
  const createMaintenance = async (maintenanceData) => {
    const res = await api.post("/maintenance", maintenanceData);
    return res.data;
  };

  // Update an existing maintenance record
  const updateMaintenance = async (maintenanceId, maintenanceData) => {
    const res = await api.put(`/maintenance/${maintenanceId}`, maintenanceData);
    return res.data;
  };

  // Delete a maintenance record (soft delete)
  const deleteMaintenance = async (maintenanceId) => {
    const res = await api.delete(`/maintenance/${maintenanceId}`);
    return res.data;
  };

  // Update maintenance status (e.g., approve, complete, etc.)
  const updateMaintenanceStatus = async (maintenanceId, maintenanceStatus) => {
  const res = await api.patch(`/maintenance/${maintenanceId}/status`, { maintenanceStatus });
  return res.data;
};
  // Assign a mechanic to a maintenance record
  const assignMechanic = async (maintenanceId, mechanicId) => {
    const res = await api.patch(`/maintenance/${maintenanceId}/assign-mechanic`, { mechanicId });
    return res.data;
  };

  return {
    getMaintenance,
    getSingleMaintenance,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
    updateMaintenanceStatus,
    assignMechanic,
  };
};
