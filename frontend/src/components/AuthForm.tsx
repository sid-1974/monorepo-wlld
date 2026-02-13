import React, { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authApi } from "@/lib";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/Auth.module.css";

interface AuthFormProps {
  mode: "login" | "signup";
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const isSignup = mode === "signup";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = isSignup
        ? await authApi.signup({ name, email, password })
        : await authApi.login({ email, password });

      login(res.data.data.user, res.data.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="url(#gradient)" />
              <path
                d="M12 20l5 5 11-11"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className={styles.title}>
            {isSignup ? "Create Account" : "Welcome Back"}
          </h1>
          <p className={styles.subtitle}>
            {isSignup
              ? "Start managing your tasks efficiently"
              : "Sign in to access your tasks"}
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4.25a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zM8 11a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {isSignup && (
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className={styles.input}
                placeholder="Enter Your Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="Enter Your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.spinner}></span>
            ) : isSignup ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className={styles.footer}>
          {isSignup ? (
            <p>
              Already have an account?{" "}
              <Link href="/auth/login" className={styles.link}>
                Sign in
              </Link>
            </p>
          ) : (
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className={styles.link}>
                Create one
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
