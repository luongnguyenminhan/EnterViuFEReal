"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Modal, Space, message } from "antd";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "@/redux/slices/authSlice";
import authApi from "@/apis/authApi";
import Cookies from "js-cookie";
import { getErrorMessage } from "@/utils/apiHandler";
import {
  loadGoogleOAuthScript,
  validateGoogleClientId,
  GOOGLE_CLIENT_ID,
  GoogleIdResponse,
} from "@/utils/googleOAuth";
import React from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  callbackUrl?: string;
  onSuccess?: () => void;
  t: (key: string) => string;
}

export default function LoginModal({
  isOpen,
  onClose,
  callbackUrl,
  onSuccess,
  t,
}: LoginModalProps) {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);  // Handle Google OAuth callback
  const handleGoogleCallback = useCallback(
    async (response: GoogleIdResponse) => {
      try {

        console.log(
          "Google credential response received ",
          response.credential
        );

        dispatch(loginStart());

        if (!response.credential) {
          throw new Error("No credential received from Google");
        }

        const result = await authApi.googleOAuthLogin(response.credential);

        console.log("Google OAuth login result: ", result);

        if (result && result.data && result.data.accessToken) {
          console.log("Cookies access: ", result.data.accessToken);
          // Store tokens in cookies
          Cookies.set("access_token", result.data.accessToken, {
            path: "/",
            expires: 1, // 1 day
            sameSite: "Lax",
            secure: window.location.protocol === "https:",
          });

          if (result.data.refreshToken) {
            console.log("Cookies refresh: ", result.data.refreshToken);
            Cookies.set("refresh_token", result.data.refreshToken, {
              path: "/",
              expires: 7, // 7 days
              sameSite: "Lax",
              secure: window.location.protocol === "https:",
            });
          }

          // Set the token in axios instance
          authApi.setToken(result.data.accessToken);

          console.log("get information");
          // Get user details
          const userDetails = await authApi.getMe();

          console.log("User details fetched: ", userDetails);
          if (userDetails) {
            // Dispatch login success with user details
            dispatch(
              loginSuccess({
                user: {
                  id: userDetails.id,
                  email: userDetails.email,
                  username: userDetails.username,
                  confirmed: userDetails.confirmed,
                  role_id: userDetails.role || undefined,
                },
              })
            );

            message.success(t("auth.loginSuccess"), 3);

            // Call success callback if provided
            if (onSuccess) {
              onSuccess();
            }

            // Close modal and redirect
            setTimeout(() => {
              onClose();
              if (callbackUrl) {
                router.push(callbackUrl);
              }
            }, 1000);
          } else {
            throw new Error("Failed to fetch user details");
          }
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        console.error("Error processing Google login:", error);
        const errorMessage = getErrorMessage(error);
        dispatch(loginFailure(errorMessage));
        message.error(errorMessage, 5);
      }
    },
    [dispatch, t, onSuccess, onClose, callbackUrl, router]
  );

  // Handle authentication success - close modal and redirect if needed
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
      if (callbackUrl) {
        router.push(callbackUrl);
      }
    }
  }, [isAuthenticated, isOpen, callbackUrl, router, onClose]);
  // Load Google OAuth script
  useEffect(() => {
    if (!validateGoogleClientId()) {
      console.error("Google Client ID is not configured properly");
      return;
    }

    const initializeGoogleOAuth = async () => {
      try {
        await loadGoogleOAuthScript();
        setIsGoogleLoaded(true);
      } catch (error) {
        console.error("Failed to load Google OAuth script:", error);
        message.error(
          t("auth.googleLoadFailed") || "Failed to load Google authentication",
          5
        );
      }
    };    if (isOpen) {
      // Reset state when modal opens
      initializeGoogleOAuth();
    }
  }, [t, isOpen]);// Initialize Google OAuth when loaded
  useEffect(() => {
    if (isGoogleLoaded && window.google && window.google.accounts) {
      // Initialize Google OAuth
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
      });      // Render Google button if ref is available
      if (googleButtonRef.current) {
        // Clear any existing content
        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%'
        });
      }
    }  }, [isGoogleLoaded, handleGoogleCallback]);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      closeIcon={
        <FontAwesomeIcon
          icon={faTimes}
          className="text-gray-500 hover:text-gray-700 text-lg"
        />
      }
      styles={{
        content: {
          borderRadius: "20px",
          padding: 0,
          background: "var(--auth-card-bg)",
          border: "1px solid var(--auth-card-border)",
        },
        mask: {
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <div className="p-8">
        <Space direction="vertical" size="large" className="w-full">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--gradient-text-from)] via-[color:var(--gradient-text-via)] to-[color:var(--gradient-text-to)]">
              {t("auth.login") || "Login"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
              {t("auth.loginWithGoogle") || "Sign in with your Google account"}
            </p>
          </div>          <div className="w-full mt-8 space-y-4">
            {/* Google Rendered Button */}
            <div className="w-full">
              <div 
                ref={googleButtonRef} 
                className="w-full flex justify-center"
                style={{ minHeight: '56px' }}
              />
            </div>
          </div>

          <div className="text-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              {t("auth.bySigningIn") ||
                "By signing in, you agree to our terms and conditions"}
            </p>
          </div>
        </Space>
      </div>
    </Modal>
  );
}
