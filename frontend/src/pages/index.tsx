import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated ? "/dashboard" : "/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <>
      <Head>
        <title>TaskTracker - Manage Your Tasks Efficiently</title>
        <meta
          name="description"
          content="A modern task management application to help you stay organized and productive."
        />
      </Head>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <div
          className="loadingSpinner"
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(255,255,255,0.06)",
            borderTopColor: "#6366f1",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    </>
  );
}
