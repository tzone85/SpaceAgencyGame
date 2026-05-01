const ROLE_ACCENTS = {
  pilot: ["#ff6b6b", "#ffd166"],
  engineer: ["#58d7ff", "#8b7cf6"],
  scientist: ["#46e6b0", "#58d7ff"],
  medical_officer: ["#ffd166", "#46e6b0"],
  mission_specialist: ["#8b7cf6", "#ff6b6b"],
};

const SKIN_TONES = ["#8f5738", "#b06b42", "#c8895c", "#d6a06f", "#f0c79b", "#6f432f"];
const HAIR_TONES = ["#121826", "#2b1b16", "#5a3825", "#683f2a", "#d4a24c", "#f8fafc"];
const BACKDROPS = ["#14213d", "#12343b", "#2d1e4a", "#3a2130", "#173f3f", "#25304f"];

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function hashString(value) {
  return String(value).split("").reduce((hash, character) => (
    (hash * 31 + character.charCodeAt(0)) >>> 0
  ), 2166136261);
}

function pick(collection, seed, offset = 0) {
  return collection[(seed + offset) % collection.length];
}

function initialsFor(name) {
  return String(name || "Crew Member")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getCrewAvatarProfile(crew) {
  const seed = hashString(`${crew.id || ""}:${crew.name || ""}:${crew.role || ""}`);
  const accents = ROLE_ACCENTS[crew.role] || ROLE_ACCENTS.mission_specialist;

  return {
    accent: accents[0],
    accentAlt: accents[1],
    backdrop: pick(BACKDROPS, seed, 3),
    hair: pick(HAIR_TONES, seed, 7),
    helmetTint: seed % 2 === 0 ? "#dff7ff" : "#f6f1ff",
    initials: initialsFor(crew.name),
    skin: pick(SKIN_TONES, seed, 11),
    smile: seed % 3 !== 0,
    visorShine: seed % 4,
  };
}

function createCrewAvatarSvg(crew) {
  const profile = getCrewAvatarProfile(crew);
  const safeName = escapeAttr(crew.name || "Crew member");
  const safeRole = escapeAttr(String(crew.role || "crew").replaceAll("_", " "));
  const smilePath = profile.smile ? "M44 55 Q50 60 56 55" : "M44 56 Q50 55 56 56";
  const shineX = 61 + profile.visorShine * 3;

  return `
    <svg class="sc-avatar-svg" viewBox="0 0 100 100" role="img" aria-label="${safeName}, ${safeRole}">
      <defs>
        <linearGradient id="suit-${escapeAttr(crew.id || profile.initials)}" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${profile.accent}"/>
          <stop offset="1" stop-color="${profile.accentAlt}"/>
        </linearGradient>
      </defs>
      <rect class="sc-avatar-bg" width="100" height="100" rx="18" fill="${profile.backdrop}"></rect>
      <circle cx="50" cy="38" r="24" fill="${profile.helmetTint}" opacity="0.92"></circle>
      <circle cx="50" cy="41" r="19" fill="${profile.skin}"></circle>
      <path d="M31 39 Q50 15 69 39 Q62 31 50 31 Q38 31 31 39Z" fill="${profile.hair}"></path>
      <circle cx="43" cy="46" r="2.1" fill="#101828"></circle>
      <circle cx="57" cy="46" r="2.1" fill="#101828"></circle>
      <path d="${smilePath}" fill="none" stroke="#101828" stroke-linecap="round" stroke-width="2"></path>
      <path d="M24 94 C27 72 36 63 50 63 C64 63 73 72 76 94Z" fill="url(#suit-${escapeAttr(crew.id || profile.initials)})"></path>
      <path d="M37 71 H63 L58 88 H42Z" fill="rgba(16, 24, 40, 0.46)"></path>
      <path d="M24 38 A26 26 0 0 1 76 38" fill="none" stroke="#f8fafc" stroke-linecap="round" stroke-width="5" opacity="0.72"></path>
      <path d="M${shineX} 27 L73 40" stroke="#ffffff" stroke-linecap="round" stroke-width="3" opacity="0.64"></path>
      <text x="50" y="91" text-anchor="middle">${escapeAttr(profile.initials)}</text>
    </svg>
  `;
}

export { createCrewAvatarSvg, getCrewAvatarProfile, initialsFor };
