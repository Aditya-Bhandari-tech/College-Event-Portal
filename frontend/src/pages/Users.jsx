import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { Trash2, UserCheck, Shield, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("asc");

  const branches = [
    { value: 'ALL', label: 'All Branches' },
    { value: 'CSE', label: 'Computer Science Engineering' },
    { value: 'IT', label: 'Information Technology' },
    { value: 'ENTC', label: 'Electronics & Telecommunication Engineering' },
    { value: 'Mechanical', label: 'Mechanical Engineering' },
    { value: 'Civil', label: 'Civil Engineering' },
    { value: 'Electrical', label: 'Electrical Engineering' },
    { value: 'Automobile', label: 'Automobile Engineering' },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/admin/users');
      // Handle different response structures
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to load users", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axiosInstance.put(`/admin/users/${id}/approve`);
      setUsers(users.map(user => user._id === id ? { ...user, isApproved: true } : user));
    } catch (error) {
      alert("Failed to approve user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
    } catch (error) {
      alert("Failed to delete user");
    }
  };


  const filteredUsers = users
    .filter(user => {
      const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesBranch = branchFilter === "ALL" || user.branch === branchFilter;
      return matchesSearch && matchesBranch;
    })
    .sort((a, b) => {
      const nameA = a.name?.toLowerCase() || "";
      const nameB = b.name?.toLowerCase() || "";
      return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  return (
    <div className="min-h-screen bg-[#f9f8f6] p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-white rounded-full transition-colors" aria-label="Back to admin dashboard">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">User Management</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2 flex-1 max-w-md">
            <Search size={20} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="flex-1 outline-none text-slate-700 min-w-0"
              aria-label="Search users by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          >
            {branches.map(b => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            {sortOrder === 'asc' ? 'Sort A-Z' : 'Sort Z-A'}
          </button>
        </div>

        {loading ? <Loader /> : error ? <div className="text-red-500">{error}</div> : (
          <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">User Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Branch</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{user.branch || "N/A"}</td>
                      <td className="px-6 py-4">
                        {user.isApproved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <UserCheck size={12} /> Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Shield size={12} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!user.isApproved && (
                            <button
                              onClick={() => handleApprove(user._id)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                            aria-label={`Delete user ${user.name}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5">
                        <EmptyState message="No users found." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <div key={user._id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                    {user.isApproved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <UserCheck size={12} /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <Shield size={12} /> Pending
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-slate-500">Branch: <span className="text-slate-700">{user.branch || 'N/A'}</span></span>
                    <span className="text-slate-300">|</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Role:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!user.isApproved && (
                      <button
                        onClick={() => handleApprove(user._id)}
                        className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Delete user ${user.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-4">
                  <EmptyState message="No users found." />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;