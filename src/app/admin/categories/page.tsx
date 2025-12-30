"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: {
    _id: string;
    name: string;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parent: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  function handleNameChange(name: string) {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMessage(null);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        ...(formData.parent && { parent: formData.parent }),
      };

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormData({ name: "", slug: "", description: "", parent: "" });
        setShowForm(false);
        setMessage({
          type: "success",
          text: "Category created successfully!",
        });
        fetchCategories();
      } else {
        const error = await res.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to create category",
        });
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      setMessage({
        type: "error",
        text: "An error occurred while creating the category",
      });
    } finally {
      setCreating(false);
      // Auto-hide message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Structure and organize your product hierarchy.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all active:scale-95 ${
            showForm
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          }`}
        >
          {showForm ? (
            <Loader2 size={20} className="rotate-45" />
          ) : (
            <Plus size={20} strokeWidth={2.5} />
          )}
          {showForm ? "Close Form" : "New Category"}
        </button>
      </div>

      {/* Modern Alerts */}
      {message && (
        <div
          className={`flex items-center gap-4 p-4 rounded-2xl border animate-in slide-in-from-top-2 duration-300 ${
            message.type === "success"
              ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
              : "bg-red-50/50 border-red-100 text-red-800"
          }`}
        >
          <div
            className={`p-2 rounded-xl ${
              message.type === "success" ? "bg-emerald-100" : "bg-red-100"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <XCircle size={18} />
            )}
          </div>
          <p className="flex-1 font-medium text-sm">{message.text}</p>
          <button
            onClick={() => setMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Create Form Section */}
        {showForm && (
          <div className="xl:col-span-4 animate-in slide-in-from-left-4 duration-500">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">
                Create New
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Menswear"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    disabled={creating}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Custom Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                    disabled={creating}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none font-mono text-xs font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Parent Hierarchy
                  </label>
                  <Select
                    value={formData.parent}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        parent: value === "none" ? "" : value,
                      })
                    }
                    disabled={creating}
                  >
                    <SelectTrigger className="w-full h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium">
                      <SelectValue placeholder="Root Level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-200">
                      <SelectItem value="none" className="font-medium">
                        Root Level (None)
                      </SelectItem>
                      {categories.map(
                        (cat) =>
                          cat.name !== "Uncategorized" && (
                            <SelectItem
                              key={cat._id}
                              value={cat._id}
                              className="font-medium"
                            >
                              {cat.name}
                            </SelectItem>
                          )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Description
                  </label>
                  <textarea
                    placeholder="Briefly describe this category..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    disabled={creating}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-black/10"
                >
                  {creating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Publish Category"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Categories List Section */}
        <div
          className={`${
            showForm ? "xl:col-span-8" : "xl:col-span-12"
          } transition-all duration-500`}
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">
                      Core Info
                    </th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">
                      Parent
                    </th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">
                      Description
                    </th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400 text-right">
                      Identifier
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
                            Scanning categories...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                            <Plus size={32} />
                          </div>
                          <div>
                            <p className="text-gray-900 font-bold">
                              Empty Catalog
                            </p>
                            <p className="text-sm text-gray-400 mt-0.5">
                              Start organizing by creating your first category.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr
                        key={category._id}
                        className="hover:bg-blue-50/20 transition-all group"
                      >
                        <td className="px-6 py-5">
                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </div>
                          <div className="text-[10px] font-mono font-bold text-gray-400 mt-0.5 lowercase">
                            /{category.slug}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {category.parent ? (
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                              {category.parent.name}
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                              Root
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-xs text-gray-500 font-medium max-w-xs truncate">
                            {category.description || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <code className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-mono">
                            {category._id.slice(-8).toUpperCase()}
                          </code>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
