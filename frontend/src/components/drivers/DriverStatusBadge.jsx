const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
};

const DriverStatusBadge = ({ status }) => (
  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[status] || "bg-gray-200 text-gray-700"}`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

export default DriverStatusBadge;
