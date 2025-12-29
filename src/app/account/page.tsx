"use client";
import React, { useState, useEffect } from "react";
import Footer from "@/components/footer";
import Header from "@/components/header/header";
import PageTitle from "@/components/pageTitle";
import StoreFeatures from "@/components/storeFeatures";
import { signIn, useSession } from "next-auth/react";
import { Loader2, Edit2, Save, X, Camera } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function Page() {
  const { status: sessionStatus } = useSession();

  // Login form state
  const [email, setEmail] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Profile state
  const [userData, setUserData] = useState<{
    name?: string;
    email: string;
    image?: string;
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

  const handleEmailSignIn = async () => {
    // Reset message
    setMessage(null);

    // Validate email
    if (!email || !email.trim()) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    try {
      setIsSigningIn(true);
      const result = await signIn("email", {
        email: email.trim(),
        redirect: false,
        callbackUrl: "/",
      });
      // await signOut()

      if (result?.error) {
        setMessage({
          type: "error",
          text: "Failed to send sign-in link. Please try again.",
        });
      } else {
        setMessage({
          type: "success",
          text: "Check your email! We've sent you a magic link to sign in.",
        });
        setEmail(""); // Clear the email field on success
      }
    } catch (error) {
      console.error("Failed to sign in:", error);
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

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
          } else {
            console.error("Failed to fetch user profile");
            setProfileFetchingError("Failed to fetch user profile");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfileFetchingError(
            "An unexpected error occurred. Please try again."
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
        body: JSON.stringify({ name: editedName.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setIsEditMode(false);
        setProfileMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        // Clear success message after 3 seconds
        setTimeout(() => setProfileMessage(null), 3000);
      } else {
        setProfileMessage({
          type: "error",
          text: "Failed to update profile. Please try again.",
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
            }
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
      <main className="px-6">
        <section className="w-full max-w-[1440px] mx-auto py-9 sm:py-12 lg:py-16 flex flex-col md:flex-row justify-between items-stretch gap-7">
          {sessionStatus === "loading" ? (
            <div className="md:basis-1/2 mx-auto sm:px-7 md:px-10 py-8 flex items-center justify-center">
              <Loader2 className="animate-spin h-12 w-12" />
            </div>
          ) : sessionStatus === "authenticated" ? (
            // Profile View for Authenticated Users
            <>
              {userData ? (
                <div className="md:basis-1/2 sm:px-7 md:px-10 py-8 flex flex-col gap-6 md:gap-8 lg:gap-10">
                  <h2 className="font-semibold text-[28px] md:text-[36px]">
                    My Profile
                  </h2>

                  {/* Avatar Section */}
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <Avatar className="w-20 h-20 md:w-24 md:h-24 cursor-pointer">
                        <AvatarImage
                          src={userData.image || ""}
                          alt={userData.name || ""}
                        />
                        <AvatarFallback
                          style={{ backgroundColor: avatarBgColor }}
                          className="text-white font-semibold text-2xl md:text-3xl"
                        >
                          {getUserInitials(userData.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Upload Overlay */}
                      <label
                        htmlFor="avatar-upload"
                        className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full ${
                          isUploadingImage ? "opacity-100" : "opacity-0"
                        } group-hover:opacity-100 transition-opacity cursor-pointer`}
                      >
                        {isUploadingImage ? (
                          <Loader2
                            className="animate-spin text-white"
                            size={24}
                          />
                        ) : (
                          <Camera className="text-white" size={24} />
                        )}
                      </label>

                      {/* Hidden File Input */}
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </div>

                    <div>
                      <p className="text-lg md:text-xl font-medium">
                        {userData.name || "No name set"}
                      </p>
                      <p className="text-sm md:text-base text-gray-600 break-all">
                        {userData.email}
                      </p>
                      {uploadError && (
                        <p className="text-xs md:text-sm text-red-600 mt-1">
                          {uploadError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="space-y-4 md:space-y-6">
                    <div>
                      <label
                        htmlFor="profileName"
                        className="block text-[14px] md:text-base font-medium mb-2"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="profileName"
                        value={editedName}
                        className="w-full px-4 h-[48px] sm:h-[56px] lg:h-[75px] border border-[#9F9F9F] rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9F9F9F] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        onChange={(e) => setEditedName(e.target.value)}
                        disabled={!isEditMode || isUpdatingProfile}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="profileEmail"
                        className="block text-[14px] md:text-base font-medium mb-2"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="profileEmail"
                        value={userData.email}
                        className="w-full px-4 h-[48px] sm:h-[56px] lg:h-[75px] border border-[#9F9F9F] rounded-lg md:rounded-xl bg-gray-100 cursor-not-allowed"
                        disabled
                      />
                      <p className="text-xs md:text-sm text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    {profileMessage && (
                      <div
                        className={`p-4 rounded-lg ${
                          profileMessage.type === "success"
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                      >
                        {profileMessage.text}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 md:gap-4">
                    {!isEditMode ? (
                      <button
                        className="px-6 md:px-10 h-9 sm:h-12 lg:h-16 border border-black md:text-lg lg:text-xl rounded-lg md:rounded-[16px] lg:rounded-[20px] flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors"
                        onClick={() => setIsEditMode(true)}
                      >
                        <Edit2 size={20} />
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          className="px-6 md:px-10 h-9 sm:h-12 lg:h-16 bg-black text-white md:text-lg lg:text-xl rounded-lg md:rounded-[16px] lg:rounded-[20px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                          onClick={handleUpdateProfile}
                          disabled={isUpdatingProfile}
                        >
                          {isUpdatingProfile ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <Save size={20} />
                          )}
                          {isUpdatingProfile ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          className="px-6 md:px-10 h-9 sm:h-12 lg:h-16 border border-gray-400 md:text-lg lg:text-xl rounded-lg md:rounded-[16px] lg:rounded-[20px] flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                          onClick={handleCancelEdit}
                          disabled={isUpdatingProfile}
                        >
                          <X size={20} />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {profileFetchingError ? (
                    <p className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg mx-auto">
                      {profileFetchingError}
                    </p>
                  ) : (
                    <div className="md:basis-1/2 mx-auto sm:px-7 md:px-10 py-8 flex items-center justify-center">
                      <Loader2 className="animate-spin h-12 w-12" />
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            // Login Form for Unauthenticated Users
            <>
              <div className="md:basis-1/2 sm:px-7 md:px-10 py-8 flex flex-col gap-6 md:gap-8 lg:gap-10">
                <h2 className="font-semibold text-[28px] md:text-[36px]">
                  Log In
                </h2>
                <div className="space-y-3 md:space-y-5">
                  <label
                    htmlFor="email"
                    className="block text-[14px] md:text-base font-medium"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    className="w-full px-4 h-[48px] sm:h-[56px] lg:h-[75px] border border-[#9F9F9F] rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9F9F9F]"
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSigningIn) {
                        handleEmailSignIn();
                      }
                    }}
                    disabled={isSigningIn}
                  />
                  {message && (
                    <div
                      className={`p-4 rounded-lg ${
                        message.type === "success"
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}
                </div>
                <button
                  className="self-start px-10 md:w-[215px] h-9 sm:h-12 lg:h-16 border border-black md:text-lg lg:text-xl rounded-lg md:rounded-[16px] lg:rounded-[20px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={handleEmailSignIn}
                  disabled={isSigningIn}
                >
                  {isSigningIn ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Log In"
                  )}
                </button>
                <div className="flex justify-start items-center gap-8">
                  <Image
                    src={"/images/Logo-google-icon.png"}
                    alt="google"
                    height={75}
                    width={75}
                    onClick={async () => await signIn("google")}
                    className="cursor-pointer h-9 w-9 sm:h-12 sm:w-12 lg:h-16 lg:w-16"
                  />
                  <Image
                    src={"/images/Facebook_Logo.png"}
                    alt="google"
                    height={75}
                    width={75}
                    onClick={async () => await signIn("facebook")}
                    className="cursor-pointer h-9 w-9 sm:h-12 sm:w-12 lg:h-16 lg:w-16"
                  />
                </div>
              </div>
              <div className="md:basis-1/2"></div>
            </>
          )}
        </section>
      </main>
      <StoreFeatures />
      <Footer />
    </>
  );
}

export default Page;
