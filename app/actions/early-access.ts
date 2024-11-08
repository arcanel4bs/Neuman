"use server";

import { createClient } from "@/utils/supabase/server";
import { Message } from "@/components/form-message";

export async function submitEarlyAccess(formData: FormData): Promise<Message> {
  try {
    const email = formData.get("email") as string;
    const supabase = await createClient();

    const { error } = await supabase
      .from("early_access_signups")
      .insert({
        email,
        status: 'pending',
        signed_up_at: new Date().toISOString(),
        metadata: {}
      });

    if (error) throw error;

    return {
      success: "Thanks for your interest! We'll be in touch soon."
    };
  } catch (err) {
    console.error("Early access signup error:", err);
    return {
      error: "Something went wrong. Please try again."
    };
  }
}