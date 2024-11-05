"use client";

import { signOutAction } from "@/app/actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ProfileComponent() {
  const [email, setEmail] = useState("");
  const [defaultSize, setDefaultSize] = useState("small");
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        // Load user preferences from database here
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('default_size')
          .single();
        
        if (preferences) {
          setDefaultSize(preferences.default_size);
        }
      }
    }
    loadProfile();
  }, []);

  const handleSavePreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          default_size: defaultSize,
        });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled />
        </div>

        

        <div className="flex gap-4">
          <Button onClick={handleSavePreferences}>
            Save Preferences
          </Button>
          <form action={signOutAction}>
            <Button variant="destructive" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 