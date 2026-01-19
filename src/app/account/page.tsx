"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { z } from "zod";
import Cookies from "js-cookie";
import Footer from "@/components/footer";
import Header from "@/components/header/header";
import PageTitle from "@/components/pageTitle";
import StoreFeatures from "@/components/storeFeatures";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Edit2,
  Save,
  X,
  Camera,
  MapPin,
  Phone,
  User as UserIcon,
  Mail,
  Home,
  Globe,
  Hash,
  ShoppingBag,
} from "lucide-react";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pakistanLocations } from "@/lib/pakistan-locations";
import AuthForm from "@/components/auth/AuthForm";

function Page() {
  const { status: sessionStatus } = useSession();

  // Login form state
  // Unauthenticated forms state - MOVED TO AuthForm component
  // We keep user data state for the profile section below

  // Profile state
  const [userData, setUserData] = useState<{
    name?: string;
    email: string;
    image?: string;
    address?: {
      fullName: string;
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postalCode: string;
      country: string;
      phone?: string;
    };
  } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [profileFetchingError, setProfileFetchingError] = useState<
    string | null
  >(null);
  const [avatarBgColor, setAvatarBgColor] = useState<string>("");

  // Image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Address state
  const [address, setAddress] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan",
    phone: "",
  });

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setAddress((prev) => {
      const newAddress = { ...prev, [name]: value };

      // Reset downstream fields
      if (name === "state") {
        newAddress.city = "";
        newAddress.postalCode = "";
        setShowCustomPostalCode(false);
      } else if (name === "city") {
        newAddress.postalCode = "";
        setShowCustomPostalCode(false);
      } else if (name === "postalCode") {
        if (value === "Other") {
          newAddress.postalCode = "";
          setShowCustomPostalCode(true);
        } else {
          setShowCustomPostalCode(false);
        }
      }

      return newAddress;
    });
  };

  const [showCustomPostalCode, setShowCustomPostalCode] = useState(false);

  // Generate a random vibrant color with good contrast for white text
  const generateRandomColor = () => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
      "#F8B739",
      "#52B788",
      "#E63946",
      "#457B9D",
      "#F77F00",
      "#06A77D",
      "#C9184A",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get user initials from name
  const getUserInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return words[0].charAt(0).toUpperCase();
  };

  // Set random color on component mount
  useEffect(() => {
    setAvatarBgColor(generateRandomColor());
  }, []);

  // Fetch user profile data when authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (sessionStatus === "authenticated") {
        try {
          const response = await fetch("/api/users");
          if (response.ok) {
            const data = await response.json();
            setUserData(data.user);
            setEditedName(data.user.name || "");
            if (data.user.address) {
              setAddress({
                fullName: data.user.address.fullName || "",
                line1: data.user.address.line1 || "",
                line2: data.user.address.line2 || "",
                city: data.user.address.city || "",
                state: data.user.address.state || "",
                postalCode: data.user.address.postalCode || "",
                country: "Pakistan",
                phone: data.user.address.phone || "",
              });
              // Check if existing postal code is custom
              const province = data.user.address.state;
              const city = data.user.address.city;
              if (province && city && data.user.address.postalCode) {
                const validCodes =
                  pakistanLocations.provinces[
                    province as keyof typeof pakistanLocations.provinces
                  ]?.cities[city as string] || [];
                if (!validCodes.includes(data.user.address.postalCode)) {
                  setShowCustomPostalCode(true);
                }
              }
            }
          } else {
            console.error("Failed to fetch user profile");
            setProfileFetchingError("Failed to fetch user profile");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfileFetchingError(
            "An unexpected error occurred. Please try again.",
          );
        }
      }
    };

    fetchUserProfile();
  }, [sessionStatus]);

  // Handle profile update
  const handleUpdateProfile = async () => {
    setProfileMessage(null);

    if (!editedName.trim()) {
      setProfileMessage({ type: "error", text: "Name cannot be empty" });
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editedName.trim(),
          address: address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(data.user);
        if (data.user.address) {
          setAddress({
            fullName: data.user.address.fullName || "",
            line1: data.user.address.line1 || "",
            line2: data.user.address.line2 || "",
            city: data.user.address.city || "",
            state: data.user.address.state || "",
            postalCode: data.user.address.postalCode || "",
            country: "Pakistan",
            phone: data.user.address.phone || "",
          });
        }
        setIsEditMode(false);
        setProfileMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        // Clear success message after 3 seconds
        setTimeout(() => setProfileMessage(null), 3000);
      } else {
        const errorMsg = data.details
          ? data.details
              .map(
                (issue: z.ZodIssue) =>
                  `${issue.path.join(".")}: ${issue.message}`,
              )
              .join(", ")
          : data.error || "Failed to update profile. Please try again.";

        setProfileMessage({
          type: "error",
          text: errorMsg,
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditedName(userData?.name || "");
    if (userData?.address) {
      setAddress({
        fullName: userData.address.fullName || "",
        line1: userData.address.line1 || "",
        line2: userData.address.line2 || "",
        city: userData.address.city || "",
        state: userData.address.state || "",
        postalCode: userData.address.postalCode || "",
        country: "Pakistan",
        phone: userData.address.phone || "",
      });
      // Check if existing postal code is custom
      const province = userData.address.state;
      const city = userData.address.city;
      if (province && city && userData.address.postalCode) {
        const validCodes =
          pakistanLocations.provinces[
            province as keyof typeof pakistanLocations.provinces
          ]?.cities[city as string] || [];
        if (!validCodes.includes(userData.address.postalCode)) {
          setShowCustomPostalCode(true);
        } else {
          setShowCustomPostalCode(false);
        }
      }
    }
    setIsEditMode(false);
    setProfileMessage(null);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);
    setProfileMessage(null);

    try {
      // Delete previous Cloudinary image if it exists
      const previousImage = userData?.image;
      if (previousImage && previousImage.includes("cloudinary.com")) {
        try {
          await fetch(
            `/api/upload?imageCloudURL=${encodeURIComponent(previousImage)}`,
            {
              method: "DELETE",
            },
          );
          console.log("Previous image deleted from Cloudinary");
        } catch (deleteError) {
          console.error("Failed to delete previous image:", deleteError);
          // Continue with upload even if deletion fails
        }
      }

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "profile-images");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadResult = await uploadResponse.json();
      const imageUrl = uploadResult.secure_url;

      // Update user profile with new image
      const updateResponse = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update profile");
      }

      const updateData = await updateResponse.json();
      setUserData(updateData.user);
      setProfileMessage({
        type: "success",
        text: "Profile image updated successfully!",
      });
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      e.target.value = "";
    }
  };

  return (
    <>
      <Header profilePic={userData?.image} />
      <PageTitle
        title="My Account"
        backgroundImageUrl="/images/pageTitleBg.jpg"
        logoImageUrl="/images/pageTitleLogo.png"
      />
      <main className="min-h-screen bg-[#F9F1E7]/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {sessionStatus === "loading" ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="relative">
                <Loader2 className="animate-spin h-16 w-16 text-[#FF5714]" />
                <div className="absolute inset-0 blur-xl bg-[#FF5714]/20 rounded-full animate-pulse"></div>
              </div>
            </div>
          ) : sessionStatus === "authenticated" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-white/20">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative group">
                      <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white shadow-xl">
                        <AvatarImage
                          src={userData?.image || ""}
                          alt={userData?.name || ""}
                        />
                        <AvatarFallback
                          style={{ backgroundColor: avatarBgColor }}
                          className="text-white font-semibold text-4xl md:text-5xl"
                        >
                          {getUserInitials(userData?.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Upload Overlay */}
                      <label
                        htmlFor="avatar-upload"
                        className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded-full ${
                          isUploadingImage ? "opacity-100" : "opacity-0"
                        } group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]`}
                      >
                        {isUploadingImage ? (
                          <Loader2
                            className="animate-spin text-white"
                            size={32}
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <Camera className="text-white mb-1" size={32} />
                            <span className="text-white text-xs font-medium">
                              Change Photo
                            </span>
                          </div>
                        )}
                      </label>

                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </div>

                    {uploadError && (
                      <div className="mt-2 text-xs font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-in fade-in slide-in-from-top-1">
                        {uploadError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {userData?.name || "Welcome!"}
                      </h2>
                      <p className="text-gray-500 font-medium">
                        Customer Account
                      </p>
                    </div>

                    <div className="w-full pt-4 border-t border-gray-100 flex flex-col gap-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600 px-2 py-2 rounded-xl bg-[#F9F1E7]/50">
                        <Mail size={18} className="text-[#FF5714]" />
                        <span className="truncate">{userData?.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 px-2 py-2 rounded-xl bg-[#F9F1E7]/50">
                        <UserIcon size={18} className="text-[#FF5714]" />
                        <span>
                          Member since{" "}
                          {userData ? new Date().getFullYear() : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/20">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Edit2 size={18} className="text-[#FF5714]" />
                    Quick Actions
                  </h3>
                  <div className="flex flex-col gap-2">
                    {!isEditMode ? (
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="w-full py-3 px-4 bg-[#88D9E6] hover:bg-[#7BC9D6] text-slate-800 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Edit2 size={18} />
                        Edit Settings
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleUpdateProfile}
                          disabled={isUpdatingProfile}
                          className="w-full py-3 px-4 bg-[#FF5714] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-[#e44d12] transition-all disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {isUpdatingProfile ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Save size={18} />
                          )}
                          {isUpdatingProfile ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isUpdatingProfile}
                          className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                        >
                          <X size={18} />
                          Cancel
                        </button>
                      </div>
                    )}
                    <Link
                      href="/orders"
                      className="w-full py-3 px-4 bg-[#F9F1E7] hover:bg-[#FF5714]/10 text-slate-800 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all border border-transparent hover:border-[#FF5714]/20 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <ShoppingBag size={18} className="text-[#FF5714]" />
                      My Orders
                    </Link>
                  </div>
                </div>

                {profileMessage && (
                  <div
                    className={`p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
                      profileMessage.type === "success"
                        ? "bg-green-100 text-green-800 border-2 border-green-200"
                        : "bg-red-100 text-red-800 border-2 border-red-200"
                    }`}
                  >
                    {profileMessage.text}
                  </div>
                )}
              </div>

              {/* Settings Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Personal Information */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5714]/5 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:w-40 group-hover:h-40"></div>

                  <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                    <div className="p-2 bg-[#FF5714]/10 rounded-xl">
                      <UserIcon size={24} className="text-[#FF5714]" />
                    </div>
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          disabled={!isEditMode || isUpdatingProfile}
                          placeholder="Your Name"
                          className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#FF5714] focus:ring-4 focus:ring-[#FF5714]/10 transition-all outline-none disabled:bg-gray-100/50 disabled:text-gray-500 font-medium"
                        />
                        <UserIcon
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={userData?.email || ""}
                          disabled
                          className="w-full pl-4 pr-10 py-3.5 bg-gray-100/50 border-2 border-gray-100 text-gray-500 rounded-2xl cursor-not-allowed font-medium"
                        />
                        <Mail
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                      </div>
                      <p className="text-[11px] text-[#FF5714] font-medium ml-1">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110"></div>

                  <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                    <div className="p-2 bg-black/5 rounded-xl">
                      <MapPin size={24} className="text-black" />
                    </div>
                    Shipping Address
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Full Name (for delivery)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="fullName"
                          value={address.fullName}
                          onChange={handleAddressChange}
                          disabled={!isEditMode || isUpdatingProfile}
                          placeholder="Recipient's Full Name"
                          className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#FF5714] focus:ring-4 focus:ring-[#FF5714]/10 transition-all outline-none disabled:bg-gray-100/50 disabled:text-gray-500 font-medium"
                        />
                        <UserIcon
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          value={address.phone}
                          onChange={handleAddressChange}
                          disabled={!isEditMode || isUpdatingProfile}
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#FF5714] focus:ring-4 focus:ring-[#FF5714]/10 transition-all outline-none disabled:bg-gray-100/50 disabled:text-gray-500 font-medium"
                        />
                        <Phone
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Street Address
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="line1"
                          value={address.line1}
                          onChange={handleAddressChange}
                          disabled={!isEditMode || isUpdatingProfile}
                          placeholder="Street name and house number"
                          className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#FF5714] focus:ring-4 focus:ring-[#FF5714]/10 transition-all outline-none disabled:bg-gray-100/50 disabled:text-gray-500 font-medium"
                        />
                        <Home
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Apartment, suite, etc. (optional)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="line2"
                          value={address.line2}
                          onChange={handleAddressChange}
                          disabled={!isEditMode || isUpdatingProfile}
                          placeholder="Apt 4B, Building C"
                          className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#FF5714] focus:ring-4 focus:ring-[#FF5714]/10 transition-all outline-none disabled:bg-gray-100/50 disabled:text-gray-500 font-medium"
                        />
                        <Home
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                          Country
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="country"
                            value="Pakistan"
                            readOnly
                            disabled
                            className="w-full pl-4 pr-10 py-3.5 bg-gray-100/50 border-2 border-gray-100 text-gray-500 rounded-2xl cursor-not-allowed font-medium"
                          />
                          <Globe
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                          State / Province
                        </label>
                        <Select
                          value={address.state}
                          onValueChange={(value) =>
                            handleSelectChange("state", value)
                          }
                          disabled={!isEditMode || isUpdatingProfile}
                        >
                          <SelectTrigger className="w-full h-[52px] px-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#FF5714] focus:ring-4 focus:ring-[#FF5714]/10 transition-all outline-none disabled:bg-gray-100/50 disabled:text-gray-500 font-medium text-left">
                            <SelectValue placeholder="Select Province" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100">
                            {Object.keys(pakistanLocations.provinces).map(
                              (prov) => (
                                <SelectItem key={prov} value={prov}>
                                  {prov}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                          City
                        </label>
                        <Select
                          value={address.city}
                          onValueChange={(value) =>
                            handleSelectChange("city", value)
                          }
                          disabled={
                            !isEditMode || isUpdatingProfile || !address.state
                          }
                        >
                          <SelectTrigger className="w-full h-[52px] px-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#FF5714] focus:ring-4 focus:ring-[#FF5714]/10 transition-all outline-none disabled:bg-gray-100/50 disabled:text-gray-500 font-medium text-left">
                            <SelectValue
                              placeholder={
                                !address.state
                                  ? "Select Province first"
                                  : "Select City"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100">
                            {address.state &&
                              Object.keys(
                                pakistanLocations.provinces[
                                  address.state as keyof typeof pakistanLocations.provinces
                                ]?.cities || {},
                              ).map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                          Postal Code
                        </label>
                        <div className="space-y-3">
                          <Select
                            value={
                              showCustomPostalCode
                                ? "Other"
                                : address.postalCode
                            }
                            onValueChange={(value) =>
                              handleSelectChange("postalCode", value)
                            }
                            disabled={
                              !isEditMode || isUpdatingProfile || !address.city
                            }
                          >
                            <SelectTrigger className="w-full h-[52px] px-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#FF5714] focus:ring-4 focus:ring-[#FF5714]/10 transition-all outline-none disabled:bg-gray-100/50 disabled:text-gray-500 font-medium text-left">
                              <SelectValue
                                placeholder={
                                  !address.city
                                    ? "Select City first"
                                    : "Select Postal Code"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-gray-100">
                              {address.state &&
                                address.city &&
                                pakistanLocations.provinces[
                                  address.state as keyof typeof pakistanLocations.provinces
                                ]?.cities[address.city]?.map((code) => (
                                  <SelectItem key={code} value={code}>
                                    {code}
                                  </SelectItem>
                                ))}
                              {address.city && (
                                <SelectItem value="Other">
                                  Other / Custom
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>

                          {showCustomPostalCode && isEditMode && (
                            <div className="relative animate-in slide-in-from-top-2">
                              <input
                                type="text"
                                name="postalCode"
                                value={address.postalCode}
                                onChange={handleAddressChange}
                                placeholder="Enter custom postal code"
                                className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-2 border-[#FF5714]/30 rounded-2xl focus:border-[#FF5714] focus:ring-4 focus:ring-[#FF5714]/10 transition-all outline-none font-medium"
                              />
                              <Hash
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FF5714]"
                                size={18}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : profileFetchingError ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
              <div className="p-4 bg-red-100 text-red-800 rounded-2xl border-2 border-red-200 font-semibold max-w-md">
                {profileFetchingError}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start py-8">
              {/* Login Card */}
              <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden">
                <AuthForm initialView="login" />
              </div>

              {/* Register Card */}
              <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden">
                <AuthForm initialView="register" />
              </div>
            </div>
          )}
        </div>
      </main>
      <StoreFeatures />
      <Footer />
    </>
  );
}

export default Page;
