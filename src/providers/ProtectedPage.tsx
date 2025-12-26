"use client";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";

const ProtectedPage = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const developer = useAuthStore((state) => state.developer);
  const setDeveloper = useAuthStore((state) => state.setDeveloper);
  const logout = useAuthStore((state) => state.logout);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const router = useRouter();
  const api = useAxios();
  const [shouldRender, setShouldRender] = useState(false);

  // Fetch latest developer profile
  const {
    data: developerData,
    error,
    isError,
  } = useQuery({
    queryKey: ["developerProfile"],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      return (await api.get("/developers/me")).data.data;
    },
    enabled: hasHydrated && isAuthenticated,
    retry: false,
  });

  // Handle updates and errors
  useEffect(() => {
    if (developerData) {
      setDeveloper(developerData);
    }
    if (isError) {
      // If unauthorized or error, logout
      logout();
      router.push("/login");
    }
  }, [developerData, isError, setDeveloper, logout, router]);

  useEffect(() => {
    if (hasHydrated) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (developer?.status === "pending") {
        router.push("/awaiting-approval");
      } else {
        // Only render if we have confirmed authentication (or if waiting for query but local state is OK for now)
        // However, if we want strict security, we might wait for the query.
        // For better UX, we can render if local state is OK, and the query will update/redirect if changed.
        setShouldRender(true);
      }
    }
  }, [hasHydrated, isAuthenticated, developer, router]);

  if (!hasHydrated || !shouldRender) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <div className="h-screen flex justify-center items-center">
            <Loader2 className="animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedPage;
