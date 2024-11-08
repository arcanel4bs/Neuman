"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signInAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const returnTo = formData.get("returnTo") as string;
    const supabase = await createClient();

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }

    if (!data.user) {
      return {
        error: true,
        message: "Invalid login credentials",
      };
    }

    // Create initial session if none exists
    const { data: existingSession } = await supabase
      .from("console_sessions")
      .select()
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!existingSession) {
      await supabase
        .from("console_sessions")
        .insert([{
          user_id: data.user.id,
          title: "New Session",
        }]);
    }

    return {
      success: true,
      redirectTo: returnTo || "/dashboard"
    };
  } catch (err) {
    console.error("Sign in error:", err);
    return {
      error: true,
      message: "An unexpected error occurred",
    };
  }
}

export async function signUpAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Check your email to confirm your account",
    };
  } catch (err) {
    console.error("Sign up error:", err);
    return {
      error: true,
      message: "An unexpected error occurred",
    };
  }
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function forgotPasswordAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    });

    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Check your email for the password reset link",
    };
  } catch (err) {
    console.error("Password reset error:", err);
    return {
      error: true,
      message: "An unexpected error occurred",
    };
  }
}

export async function resetPasswordAction(formData: FormData) {
  try {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      return {
        error: true,
        message: "Passwords do not match",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (err) {
    console.error("Password reset error:", err);
    return {
      error: true,
      message: "An unexpected error occurred",
    };
  }
}
