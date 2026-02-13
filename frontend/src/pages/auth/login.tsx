import Head from "next/head";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Sign In - TaskTracker</title>
        <meta
          name="description"
          content="Sign in to your TaskTracker account to manage your tasks."
        />
      </Head>
      <AuthForm mode="login" />
    </>
  );
}
