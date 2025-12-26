"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useAxios, { ApiError, ApiResponse } from "@/hooks/useAxios";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Quote, ArrowRight, ShieldCheck } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";

const LoginPage = () => {
  const api = useAxios();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const formSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending } = useMutation<
    ApiResponse<{
      developer: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        contactNumber: string;
        status: "pending" | "approved" | "blacklisted";
      };
      token: string;
    }>,
    ApiError,
    z.infer<typeof formSchema>
  >({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return (await api.post("/developers/login", data)).data;
    },
    onSuccess: ({ data }) => {
      toast.success("Login successful");
      const { developer, token } = data;
      if (developer && token) {
        login(developer, token);
        if (developer.status === "pending") {
          router.push("/awaiting-approval");
        } else {
          router.push("/");
        }
      } else {
        toast.error("Login failed");
      }
    },
    onError: (error: ApiError) => {
      console.log("Error", error.response?.data?.message);
      form.setError("root", {
        message: error.response?.data?.message || "An error occurred",
      });
      toast.error(error.response?.data?.message || "An error occurred");
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data);
  };

  return (
    <div className="bg-black text-white min-h-screen flex w-full selection:bg-zinc-800 selection:text-white font-sans">
      {/* Left Panel: Visual/Brand (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-zinc-900">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-zinc-950 bg-grain z-0"></div>
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-zinc-900/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-zinc-800/10 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        ></div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-white" />
            <span className="text-lg font-medium tracking-tighter text-white">
              BROKWISE DEVELOPER
            </span>
          </div>
        </div>

        {/* Testimonial / Art Content */}
        <div className="relative z-10 max-w-lg">
          <Quote className="text-zinc-600 mb-6 h-6 w-6" />
          <p className="text-xl font-light leading-relaxed text-zinc-300 tracking-tight">
            Empowering developers to build smarter, faster, and more secure
            integrations. Brokwise gives you the tools and infrastructure to
            manage trading, compliance, and client relationships with
            confidence.
          </p>
          <div className="mt-8 flex items-center gap-4"></div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex justify-between items-end text-xs text-zinc-600 font-medium uppercase tracking-widest">
          <span>© 2025 Brokwise</span>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black relative z-20">
        {/* Mobile Logo (Visible only on small screens) */}
        <div className="absolute top-8 left-8 lg:hidden">
          <span className="text-lg font-medium tracking-tighter text-white">
            BROKWISE DEVELOPER
          </span>
        </div>

        <div className="w-full max-w-[380px] space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-medium tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-500 font-normal">
              Enter your credentials to access the workspace.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {form.formState.errors.root && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {form.formState.errors.root.message}
                </div>
              )}

              {/* Email Input */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-zinc-400 block ml-1">
                      Email address
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <input
                          {...field}
                          type="email"
                          placeholder="name@company.com"
                          autoComplete="email"
                          className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder-zinc-700 shadow-sm"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Password Input */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-zinc-400 block ml-1">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder-zinc-700 shadow-sm"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-white text-black hover:bg-zinc-200 focus:ring-4 focus:ring-zinc-800 font-medium rounded-lg text-sm px-5 py-3 text-center transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isPending ? (
                  <>
                    <span className="mr-2">Signing in...</span>
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </Form>

          {/* Footer Sign Up */}
          <p className="text-center text-xs text-zinc-500 pt-4">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-white hover:underline decoration-zinc-500 underline-offset-4 transition-all"
            >
              Request access
            </Link>
          </p>
        </div>

        {/* Bottom Right Help */}
        <div className="absolute bottom-8 right-8">
          <Link
            href="#"
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <span className="text-xs font-medium">Help & Support</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
