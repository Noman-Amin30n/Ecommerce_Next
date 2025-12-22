// src/components/admin/StatusBadge.tsx
import { OrderStatus } from "@/models/order";

interface StatusBadgeProps {
  status: OrderStatus | "published" | "draft";
  className?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-purple-100 text-purple-800 border-purple-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-gray-100 text-gray-800 border-gray-200",
  published: "bg-green-100 text-green-800 border-green-200",
  draft: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function StatusBadge({
  status,
  className = "",
}: StatusBadgeProps) {
  const colorClass = statusColors[status] || statusColors.pending;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colorClass} ${className}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
