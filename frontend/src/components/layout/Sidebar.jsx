import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import AuthContext from "../../lib/AuthContext";
import { PERMISSIONS } from "../../config/rolePermissions";
import LogoutModal from "./LogoutModal";

const Sidebar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const items = isAuthenticated
    ? PERMISSIONS.filter((p) => {
        const isAllowedRole = p.roles.includes(user?.role);
        if (!isAllowedRole) return false;

        // Custom display filters for presentation mode
        if (user?.role === "Operational Manager") {
          return ["dashboard", "drivers", "units", "schedules", "analytics"].includes(p.key);
        }
        if (user?.role === "Cashier") {
          return ["dashboard", "remittances"].includes(p.key);
        }
        if (user?.role === "Fuel Pump Attendant") {
          return ["dashboard", "fuel"].includes(p.key);
        }
        if (user?.role === "Mechanic") {
          return ["dashboard", "maintenance"].includes(p.key);
        }
        return true;
      })
    : [];

  const handleConfirmLogout = () => {
    // Call existing logout from AuthContext, then redirect to home
    logout();
    setShowLogout(false);
    navigate("/");
  };

  return (
    <aside className="w-64 bg-blue-950 text-blue-100 flex flex-col justify-between h-screen sticky top-0 border-r border-white/5">
      <div className="flex flex-col flex-1">
        <div className="px-6 py-5 border-b border-white/10 mb-4">
          <span className="block text-[10px] font-bold text-blue-400 tracking-wider uppercase mb-1">Cooperative Portal</span>
          <span className="block text-sm font-extrabold text-white tracking-tight leading-tight uppercase">
            SAN PEDRO TRANSPORT COOPERATIVE
          </span>
        </div>
        <nav className="px-3 flex-1">
          {items.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-1 border-l-4 ${
                  isActive
                    ? "bg-white/10 text-white font-semibold border-red-600"
                    : "border-transparent text-blue-200/80 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-blue-300 hover:bg-white/5 hover:text-red-400"
          onClick={() => setShowLogout(true)}
        >
          Logout
        </button>
      </div>

      <LogoutModal
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleConfirmLogout}
      />
    </aside>
  );
};

export default Sidebar;
