import React from "react";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";

function StoreFeatures() {
  const features = [
    {
      icon: (
        <Truck
          size={36}
          strokeWidth={1.25}
          className="text-black group-hover:text-[#FF5714] transition-colors duration-300"
        />
      ),
      title: "Free Delivery",
      description: "Enjoy complimentary shipping on all orders exceeding $50.",
    },
    {
      icon: (
        <RotateCcw
          size={36}
          strokeWidth={1.25}
          className="text-black group-hover:text-[#FF5714] transition-colors duration-300"
        />
      ),
      title: "90 Days Return",
      description:
        "Hassle-free returns within 90 days if you're not satisfied.",
    },
    {
      icon: (
        <ShieldCheck
          size={36}
          strokeWidth={1.25}
          className="text-black group-hover:text-[#FF5714] transition-colors duration-300"
        />
      ),
      title: "Secure Payment",
      description:
        "100% encrypted and safe payment processing for your security.",
    },
  ];

  return (
    <div className="w-full py-10 md:py-16 lg:py-20 px-6 bg-gradient-to-b from-[#FAF4F4] to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 md:p-8 rounded-[32px] bg-white/30 hover:bg-white transition-all duration-500 border border-transparent hover:border-[#f1f1f1] hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)]"
            >
              <div className="mb-6 p-4 w-fit rounded-2xl bg-white shadow-sm border border-[#f5f5f5] group-hover:shadow-md transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="font-medium text-xl lg:text-2xl mb-3 text-black tracking-tight">
                {feature.title}
              </h3>
              <p className="text-[#9F9F9F] text-sm lg:text-base leading-relaxed font-normal">
                {feature.description}
              </p>
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                <div className="w-16 h-16 rounded-full bg-[#FF5714] blur-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StoreFeatures;
