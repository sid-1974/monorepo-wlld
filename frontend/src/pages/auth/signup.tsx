import Head from "next/head";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <>
      <Head>
        <title>Create Account - TaskTracker</title>
        <meta
          name="description"
          content="Create a free TaskTracker account and start managing your tasks."
        />
      </Head>
      <AuthForm mode="signup" />
    </>
  );
}
