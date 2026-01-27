/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config(); // load .env.local
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
);

async function hashPasswords() {
  // Fetch all users
  const { data: users, error } = await supabase
    .from("admins")
    .select("id, password");
  if (error || !users) {
    return;
  }

  for (const user of users) {
    const hashed = bcrypt.hashSync(user.password, 10);

    // Update password in database
    const { error: updateError } = await supabase
      .from("admins")
      .update({ password: hashed })
      .eq("id", user.id);

    if (updateError)
      console.error(`Failed to update user ${user.id}:`, updateError);
    else console.log(`Updated user ${user.id}`);
  }

  console.log("All passwords hashed!");
}

hashPasswords();
