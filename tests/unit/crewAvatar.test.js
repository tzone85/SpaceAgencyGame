import {
  createCrewAvatarSvg,
  getCrewAvatarProfile,
  initialsFor,
} from "../../src/app/crewAvatar.js";

describe("crew avatars", () => {
  test("creates deterministic portrait profiles for the same crew member", () => {
    const crew = { id: "sara_sabry", name: "Sara Sabry", role: "scientist" };

    expect(getCrewAvatarProfile(crew)).toEqual(getCrewAvatarProfile(crew));
  });

  test("uses role color accents so crew roles are easier to scan", () => {
    const pilot = getCrewAvatarProfile({ id: "pilot-1", name: "Pilot One", role: "pilot" });
    const scientist = getCrewAvatarProfile({ id: "science-1", name: "Science One", role: "scientist" });

    expect(pilot.accent).not.toBe(scientist.accent);
  });

  test("renders accessible SVG avatars without leaking raw markup from names", () => {
    const svg = createCrewAvatarSvg({
      id: "crew-danger",
      name: "<Pilot> Alert",
      role: "engineer",
    });

    expect(svg).toContain("role=\"img\"");
    expect(svg).toContain("&lt;Pilot&gt; Alert");
    expect(svg).not.toContain("<Pilot> Alert");
  });

  test("creates readable initials from crew names", () => {
    expect(initialsFor("Cheick Diarra")).toBe("CD");
    expect(initialsFor("Nandi")).toBe("N");
  });
});
