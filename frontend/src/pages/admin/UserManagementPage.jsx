import { useEffect, useState } from "react";
import { useUserApi } from "../../lib/userApi";

const UserManagementPage = () => {
  const {getUsers, createUser, updateUser, deactivateUser,} = useUserApi();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getUsers();
        console.log("Users API:", data);
        console.log("Loading Before:", loading);
        setUsers(data.users || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to fetch users");
      } finally {
        console.log("Loading Finished");
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filtered and searched users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = role ? user.role === role : true;
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  // Modal handlers
  const openModal = () => {
  setSelectedUser(null);

  setFormData({
    fullName: "",
    email: "",
    password: "",
    role: "Cashier",
  });

  setModalOpen(true);
};
  const closeModal = () => setModalOpen(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  password: "",
  role: "user",
});

const handleEdit = (user) => {
  setSelectedUser(user);

  setFormData({
    fullName: user.fullName || "",
    email: user.email || "",
    password: "",
    role: user.role || "user",
  });

  console.log("Editing:", user);

  setModalOpen(true);

};

const handleArchive = async (user) => {
  const confirmArchive = window.confirm(
    `Archive ${user.fullName}?`
  );

  if (!confirmArchive) return;

  try {
    console.log("Archiving:", user);

    // API call 
    await deactivateUser(user._id);

setUsers((prev) =>
  prev.filter((u) => u._id !== user._id)
);

    alert("User archived successfully");
  } catch (err) {
    console.error(err);
    alert("Failed to archive user");
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (selectedUser) {
      await updateUser(selectedUser._id, formData);

      alert("User updated successfully");
    } else {
      await createUser(formData);

      alert("User created successfully");
    }

    const data = await getUsers();
    setUsers(data.users || []);

    closeModal();
  } catch (err) {
    console.log(err.response?.data);
   alert(err.response?.data?.message || "Operation failed");
  }
};

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 text-slate-800">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
      {/* Search, filter, and actions bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6 bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full md:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full md:w-40"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 active:scale-95 md:ml-auto" onClick={openModal}>
          + Add User
        </button>
      </div>
      {/* Loading and error states */}
      {loading && <div className="text-center py-8 text-xs font-semibold text-slate-500">Loading users...</div>}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200/60 text-xs font-semibold rounded-lg mb-4">{error}</div>
      )}
      {/* Users table placeholder */}
      <div className="overflow-x-auto border border-slate-200/60 rounded-xl bg-white shadow-sm">
  <table className="min-w-full table-auto border-collapse text-left text-xs md:text-sm">
    <thead>
      <tr className="bg-slate-50 border-b border-slate-200/60">
        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Name</th>
        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Email</th>
        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Role</th>
        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Status</th>
        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
      </tr>
    </thead>

    <tbody>
      {filteredUsers
        .slice((page - 1) * pageSize, page * pageSize)
        .map((user) => (
         <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50/55 transition-colors duration-150 odd:bg-white even:bg-slate-50/20">
  <td className="px-5 py-3.5 text-xs font-semibold text-slate-800">{user.fullName}</td>
  <td className="px-5 py-3.5 text-xs text-slate-600">{user.email}</td>
  <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">{user.role}</td>
  <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">{user.status || "Active"}</td>

  <td className="px-5 py-3.5 flex gap-2 items-center">
    <button
      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded border border-blue-200/60 transition-all duration-150 active:scale-95"
      onClick={() => handleEdit(user)}
    >
      Edit
    </button>

    <button
    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded border border-red-200/60 transition-all duration-150 active:scale-95"
    onClick={() => handleArchive(user)}
  >
    Archive
  </button>
</td>
</tr>
      ))}
      
    </tbody>
  </table>
</div>
      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-5 border-t border-slate-100 pt-4">
        <div className="text-xs font-medium text-slate-500">
          Page {page} of {totalPages || 1}
        </div>
        <div className="flex gap-1.5">
          <button
         className="px-3 py-1 text-xs font-semibold border rounded-lg transition-all duration-150 shadow-xs bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
         onClick={() => setPage((p) => Math.max(1, p - 1))}
         disabled={page === 1}
          >
         Prev
    </button>
          <button
            className="px-3 py-1 text-xs font-semibold border rounded-lg transition-all duration-150 shadow-xs bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
      {/* Modal placeholder */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider"> {selectedUser ? "Edit User" : "Add User"}</h2>
              <button className="text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors duration-150" onClick={closeModal}>
                ✕
              </button>
            </div>
            {/* Modal content will go here */}
            <form className="space-y-4" onSubmit={handleSubmit}>
  <input
  type="text"
  className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
  value={formData.fullName}
  onChange={(e) =>
    setFormData({
      ...formData,
      fullName: e.target.value,
    })
  }
/>

<input
  type="email"
  className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
  value={formData.email}
  onChange={(e) =>
    setFormData({
      ...formData,
      email: e.target.value,
    })
  }
/>

<input
  type="password"
  placeholder={
    selectedUser
      ? "Leave blank to keep current password"
      : "Password"
  }
  className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
  value={formData.password}
  onChange={(e) =>
    setFormData({
      ...formData,
      password: e.target.value,
    })
  }
/>

  <select
  className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 w-full"
  value={formData.role}
  onChange={(e) =>
    setFormData({
      ...formData,
      role: e.target.value,
    })
  }
>
<option value="Cashier">Cashier</option>
<option value="Administrator">Administrator</option>
<option value="Super Admin">Super Admin</option>
<option value="Mechanic">Mechanic</option>
<option value="Operational Manager">Operational Manager</option>
<option value="Fuel Pump Attendant">Fuel Pump Attendant</option>
</select>

 <button
  type="submit"
  className="w-full px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 active:scale-95 mt-2"
>
  {selectedUser
    ? "Update User"
    : "Create User"}
</button>

</form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
