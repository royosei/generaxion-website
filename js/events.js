// ============================================================
// EVENTS
// ============================================================

function formatEventDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// Fetches upcoming events. Works for both signed-out visitors (public landing page)
// and signed-in members (dashboard), because the "select" policy in schema.sql allows everyone to read.
async function fetchUpcomingEvents() {
  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }
  return data;
}

// Renders a read-only list (used on the public landing page — no RSVP buttons).
function renderPublicEvents(events, container) {
  if (events.length === 0) {
    container.innerHTML = `<p class="empty-state">No upcoming events yet — check back soon.</p>`;
    return;
  }
  container.innerHTML = events.map(ev => `
    <article class="event-card">
      <div class="event-badge">${new Date(ev.event_date).getDate()}</div>
      <div class="event-body">
        <h3>${escapeHtml(ev.title)}</h3>
        <p class="event-meta">${formatEventDate(ev.event_date)} · ${escapeHtml(ev.location || "TBA")}</p>
        <p>${escapeHtml(ev.description || "")}</p>
      </div>
    </article>
  `).join("");
}

// Renders events WITH RSVP buttons (used on the members-only dashboard).
async function renderMemberEvents(events, container, userId) {
  const { data: myRsvps } = await supabaseClient
    .from("event_rsvps")
    .select("event_id, status")
    .eq("user_id", userId);

  const rsvpMap = Object.fromEntries((myRsvps || []).map(r => [r.event_id, r.status]));

  if (events.length === 0) {
    container.innerHTML = `<p class="empty-state">No upcoming events yet — check back soon.</p>`;
    return;
  }

  container.innerHTML = events.map(ev => {
    const currentStatus = rsvpMap[ev.id];
    const isGoing = currentStatus === "going";
    return `
      <article class="event-card">
        <div class="event-badge">${new Date(ev.event_date).getDate()}</div>
        <div class="event-body">
          <h3>${escapeHtml(ev.title)}</h3>
          <p class="event-meta">${formatEventDate(ev.event_date)} · ${escapeHtml(ev.location || "TBA")}</p>
          <p>${escapeHtml(ev.description || "")}</p>
          <button class="rsvp-btn ${isGoing ? "is-going" : ""}" data-event-id="${ev.id}">
            ${isGoing ? "✓ You're going" : "RSVP — I'm going"}
          </button>
        </div>
      </article>
    `;
  }).join("");

  container.querySelectorAll(".rsvp-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const eventId = btn.dataset.eventId;
      const goingNow = btn.classList.contains("is-going");

      if (goingNow) {
        await supabaseClient.from("event_rsvps").delete().eq("event_id", eventId).eq("user_id", userId);
        btn.classList.remove("is-going");
        btn.textContent = "RSVP — I'm going";
      } else {
        await supabaseClient.from("event_rsvps").upsert(
          { event_id: eventId, user_id: userId, status: "going" },
          { onConflict: "event_id,user_id" }
        );
        btn.classList.add("is-going");
        btn.textContent = "✓ You're going";
      }
    });
  });
}

// Basic HTML-escaping so event text from the database can't break the page.
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
