// ============================================================
// AUTH HELPERS
// ============================================================

async function signUp(fullName, email, password) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName } // read by the handle_new_user() trigger in schema.sql
    }
  });
  return { data, error };
}

async function signIn(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function signOut() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

// Call this at the top of any page that should only be visible to logged-in members.
// Redirects to login.html if there's no active session.
async function requireLogin() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  return session;
}
