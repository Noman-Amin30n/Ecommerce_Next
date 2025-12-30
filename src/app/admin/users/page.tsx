"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Shield,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import Image from "next/image";
import { Role } from "@/models/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  _id: string;
  name?: string;
  email: string;
  role: Role;
  emailVerified?: boolean;
  updatedAt: string;
  image?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      });

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function updateUserRole(userId: string, newRole: Role) {
    setUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          User Directory
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Manage access levels and monitor user engagement.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search */}
          <div className="md:col-span-8 relative group">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium"
            />
          </div>

          {/* Role Filter */}
          <div className="md:col-span-4">
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium">
                <SelectValue placeholder="All Access Levels" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200">
                <SelectItem value="all" className="font-medium">
                  All User Roles
                </SelectItem>
                <SelectItem value="admin" className="font-medium text-red-600">
                  Administrator
                </SelectItem>
                <SelectItem
                  value="seller"
                  className="font-medium text-blue-600"
                >
                  Verified Seller
                </SelectItem>
                <SelectItem
                  value="customer"
                  className="font-medium text-gray-600"
                >
                  Standard Customer
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">
                  User Identity
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">
                  Access Role
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">
                  Security
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400 text-right">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium text-gray-400">
                        Fetching user database...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                        <Users size={32} />
                      </div>
                      <div>
                        <p className="text-gray-900 font-bold">
                          No users matches
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Refine your search parameters.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-blue-50/30 transition-all group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50 group-hover:scale-110 transition-transform">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name || ""}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
                              <UserIcon size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {user.name || "Anonymous User"}
                          </div>
                          <div className="text-xs text-gray-400 font-medium truncate max-w-[200px]">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          updateUserRole(user._id, value as Role)
                        }
                        disabled={updating === user._id}
                      >
                        <SelectTrigger className="w-[140px] h-9 bg-white border-gray-200 rounded-lg text-xs font-bold shadow-sm hover:border-blue-200 transition-all">
                          {updating === user._id ? (
                            <div className="flex items-center gap-2">
                              <Shield
                                size={14}
                                className="animate-pulse text-blue-500"
                              />
                              Updating...
                            </div>
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-200">
                          <SelectItem
                            value="customer"
                            className="text-xs font-bold"
                          >
                            Standard
                          </SelectItem>
                          <SelectItem
                            value="seller"
                            className="text-xs font-bold text-blue-600"
                          >
                            Merchant
                          </SelectItem>
                          <SelectItem
                            value="admin"
                            className="text-xs font-bold text-red-600"
                          >
                            Super Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-5">
                      {user.emailVerified ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase tracking-wider">
                          <CheckCircle2 size={14} />
                          Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                          <XCircle size={14} />
                          Pending
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-[10px] text-gray-400 font-bold">
                      {new Date(user.updatedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium font-mono">
              USERS PAGE {page} OF {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
