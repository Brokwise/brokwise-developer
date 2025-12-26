"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Clock, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

const AwaitingApprovalPage = () => {
  const api = useAxios();
  const setDeveloper = useAuthStore((state) => state.setDeveloper);
  const router = useRouter();

  // Poll for developer status
  const { data: developerData } = useQuery({
    queryKey: ["developerProfilePoll"],
    queryFn: async () => {
      return (await api.get("/developers/me")).data.data;
    },
    refetchInterval: 5000, // Check every 5 seconds
  });

  useEffect(() => {
    if (developerData) {
      setDeveloper(developerData);
      if (developerData.status === "approved") {
        router.push("/");
      }
    }
  }, [developerData, setDeveloper, router]);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-4 selection:bg-zinc-800 selection:text-white font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-zinc-950 bg-grain z-0"></div>
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      ></div>
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-zinc-900/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 max-w-md w-full text-center space-y-8 p-8 border border-zinc-900 bg-zinc-950/50 backdrop-blur-sm rounded-2xl shadow-2xl">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-inner">
            <Clock className="h-8 w-8 text-yellow-500 animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-medium tracking-tight text-white">
            Awaiting Approval
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Your developer account has been created successfully and is
            currently pending administrative approval. You will receive an email
            once your account has been verified.
          </p>
          <p className="text-zinc-500 text-xs pt-2">
            This page will automatically refresh once approved.
          </p>
        </div>

        <div className="pt-4 border-t border-zinc-900">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>

      <div className="absolute top-8 left-8 flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-white" />
        <span className="text-lg font-medium tracking-tighter text-white">
          BROKWISE DEVELOPER
        </span>
      </div>
    </div>
  );
};

export default AwaitingApprovalPage;
