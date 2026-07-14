import { useState } from "react";

const DriverSearchBar = ({ onSearch, onStatusFilter }) => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const handleSearch = e => {
    e.preventDefault();
    onSearch && onSearch(query);
  };

  const handleStatusChange = e => {
    setStatus(e.target.value);
    onStatusFilter && onStatusFilter(e.target.value);
  };

  return (
    <form className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-3 mb-5" onSubmit={handleSearch}>
      <input
        className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 flex-1"
        placeholder="Search drivers..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <select 
        className="border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 min-w-[150px]" 
        value={status} 
        onChange={handleStatusChange}
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="pending">Pending</option>
      </select>
      <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 active:scale-95 hover:shadow-md flex items-center justify-center gap-1.5" type="submit">
        Search
      </button>
    </form>
  );
};

export default DriverSearchBar;
