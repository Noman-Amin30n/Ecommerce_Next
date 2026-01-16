"use client";
import React from "react";
import {
  Check,
  Clock,
  CreditCard,
  Package,
  Truck,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { OrderStatus } from "@/models/order";

interface TrackOrderProps {
  status: OrderStatus;
}

const statusSteps = [
  { id: "pending", label: "Pending", icon: Clock },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: Package },
  { id: "paid", label: "Paid", icon: CreditCard },
];

const TrackOrder: React.FC<TrackOrderProps> = ({ status }) => {
  const isCancelled = status === "cancelled";
  const isRefunded = status === "refunded";

  if (isCancelled || isRefunded) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex items-center gap-4">
        {isCancelled ? (
          <XCircle className="text-red-500 w-10 h-10" />
        ) : (
          <RotateCcw className="text-red-500 w-10 h-10" />
        )}
        <div>
          <h4 className="text-lg font-medium text-red-900 capitalize">
            Order {status}
          </h4>
          <p className="text-red-700 text-sm">
            {isCancelled
              ? "This order has been cancelled. If you have any questions, please contact support."
              : "This order has been refunded. The amount should reflect in your account soon."}
          </p>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((step) => step.id === status);

  return (
    <div className="w-full py-8">
      <div className="relative flex justify-between">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>

        {/* Active Progress Line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-[#FF5714] -translate-y-1/2 z-0 transition-all duration-500"
          style={{
            width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
          }}
        ></div>

        {statusSteps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted =
            index < currentStepIndex ||
            (status === "paid" && index === currentStepIndex);
          const isActive = index === currentStepIndex && status !== "paid";

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center group"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isCompleted
                    ? "bg-[#FF5714] border-[#FF5714] text-white"
                    : isActive
                    ? "bg-white border-[#FF5714] text-[#FF5714] shadow-[0_0_15px_rgba(255,87,20,0.3)]"
                    : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check size={20} strokeWidth={3} />
                ) : (
                  <Icon size={20} />
                )}
              </div>
              <div className="absolute top-12 whitespace-nowrap text-center">
                <span
                  className={`text-xs font-medium leading-none ${
                    isActive
                      ? "text-[#FF5714]"
                      : isCompleted
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
                {isActive && (
                  <div className="mt-1 flex justify-center">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-[#FF5714] animate-ping"></span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackOrder;
