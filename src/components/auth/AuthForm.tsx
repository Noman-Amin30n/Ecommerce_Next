"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";

interface AuthFormProps {
  initialView?: "login" | "register";
  onSuccess?: () => void;
  showSocials?: boolean;
}

export default function AuthForm({
  initialView = "login",
  onSuccess,
  showSocials = true,
}: AuthFormProps) {
  const pathname = usePathname();
  const isAccountPage = pathname === "/account";
  const [view, setView] = useState<"login" | "register">(initialView);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleEmailSignIn = async () => {
    setMessage(null);

    // Validate email
    if (!email || !email.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your email address",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await signIn("email", {
        email: email.trim(),
        redirect: false,
        callbackUrl: "/",
      });

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
        setEmail("");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Failed to sign in:", error);
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header View Switcher */}
      <div className="flex items-center gap-4 mb-6">
        {!isAccountPage ? (
          <>
            <button
              onClick={() => setView("login")}
              className={`text-2xl font-semibold transition-colors ${
                view === "login" ? "text-gray-900" : "text-gray-400"
              }`}
            >
              Login
            </button>
            <span className="text-gray-300 text-2xl">/</span>
            <button
              onClick={() => setView("register")}
              className={`text-2xl font-semibold transition-colors ${
                view === "register" ? "text-gray-900" : "text-gray-400"
              }`}
            >
              Register
            </button>
          </>
        ) : (
          <span className="text-2xl font-semibold text-gray-900">{view}</span>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="authEmail"
            className="text-sm font-medium text-gray-700 ml-1 uppercase"
          >
            {view === "login" ? "Username or email address" : "Email address"}
          </label>
          <input
            type="email"
            id="authEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleEmailSignIn();
              }
            }}
            disabled={isLoading}
            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl focus:border-[#FF5714] focus:ring-4 focus:ring-[#FF5714]/5 transition-all outline-none font-medium text-gray-900"
            placeholder="name@example.com"
          />
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm font-medium animate-in zoom-in-95 duration-300 ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {view === "login" && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <input
              type="checkbox"
              id="remember"
              className="rounded border-gray-300 text-[#FF5714] focus:ring-[#FF5714]"
            />
            <label htmlFor="remember">Remember me</label>
          </div>
        )}

        {view === "register" && (
          <div className={`space-y-4 ${isAccountPage ? "text-sm" : "text-xs"} text-gray-600`}>
            <p>
              A link to verify your email will be sent to your email address.
            </p>
            <p>
              Your personal data will be used to support your experience
              throughout this website, to manage access to your account, and for
              other purposes described in our privacy policy.
            </p>
          </div>
        )}

        <button
          className="w-full py-3.5 px-12 border border-black text-black rounded-xl font-medium text-lg hover:bg-black hover:text-white transition-all transform active:scale-[0.98] disabled:opacity-50"
          onClick={handleEmailSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : view === "login" ? (
            "Log In"
          ) : (
            "Register"
          )}
        </button>

        {showSocials && (
          <>
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className={`flex-shrink mx-4 text-gray-400 ${isAccountPage ? "text-xs" : "text-[10px]"} font-semibold uppercase tracking-widest leading-none`}>
                Or {view} with
              </span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={async () => await signIn("google")}
                className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm text-gray-700 shadow-sm"
              >
                <Image
                  src={"/images/Logo-google-icon.png"}
                  alt="google"
                  height={20}
                  width={20}
                />
                Google
              </button>
              <button
                onClick={async () => await signIn("facebook")}
                className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm text-gray-700 shadow-sm"
              >
                <Image
                  src={"/images/Facebook_Logo.png"}
                  alt="facebook"
                  height={20}
                  width={20}
                />
                Facebook
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
