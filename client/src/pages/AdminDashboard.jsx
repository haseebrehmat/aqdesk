import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Users,
  Shield,
  Trash2,
  Edit,
  Plus,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Search,
  AlertCircle,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal & Form State for Creating a User
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "1", // Adjust default role ID depending on your DB
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin =
    currentUser.role?.role_name?.toLowerCase() === "admin" ||
    currentUser.role === "admin";

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data.users);
    } catch (err) {
      setError(
        "Unauthorized access or failed to fetch users. Ensure you have administrator privileges.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/admin/users/${id}`, { is_active: !currentStatus });
      setUsers(
        users.map((u) =>
          u.id === id ? { ...u, is_active: !currentStatus } : u,
        ),
      );
    } catch (err) {
      alert("Failed to update user status.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const response = await api.post("/admin/users", formData);
      setUsers([response.data.user, ...users]);
      setIsCreateModalOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role_id: "1",
        is_active: true,
      });
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Failed to create user. Please check your inputs.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = (user) => {
    alert(`Trigger Edit User for: ${user.name}`);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-12 text-white font-sans relative">
      <div className="max-w-6xl mx-auto">
        {/* Top Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 mb-1">
              <Shield className="w-4 h-4" />
              <span>ADMINISTRATION CONTROL PANEL</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              User Management Ecosystem
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Supervise platform accounts, toggle account access, and manage
              security settings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Create User Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create User</span>
            </button>

            {/* Dynamic Back Dashboard Button */}
            <Link
              to={isAdmin ? "/dashboard" : "/dashboard"}
              className="inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-xl text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm mb-6 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search and Stats Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Total Registered Accounts:{" "}
            <span className="text-white font-bold">{users.length}</span>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-900/50">
                  <th className="p-4">User Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-800/40 transition"
                    >
                      <td className="p-4 font-medium text-white">
                        {user.name}
                      </td>
                      <td className="p-4 text-slate-300">{user.email}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {user.role?.role_name || "Standard User"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() =>
                            handleToggleStatus(user.id, user.is_active)
                          }
                          className="flex items-center space-x-1.5 cursor-pointer hover:opacity-80 transition"
                          title="Click to toggle status"
                        >
                          {user.is_active ? (
                            <span className="flex items-center text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />{" "}
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center text-red-400 text-xs font-medium bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition inline-flex items-center cursor-pointer"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition inline-flex items-center cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-8 text-center text-slate-500 text-sm"
                    >
                      No matching user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" /> Create New User
                Account
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    User Role
                  </label>
                  <select
                    value={formData.role_id}
                    onChange={(e) =>
                      setFormData({ ...formData, role_id: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
                  >
                    <option value="1">Admin</option>
                    <option value="2">Expert</option>
                    <option value="3">Employer</option>
                    <option value="4">Standard User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Account Status
                  </label>
                  <select
                    value={formData.is_active ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.value === "true",
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
