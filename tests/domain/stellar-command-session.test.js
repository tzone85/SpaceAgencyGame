import {
  advanceDays,
  createInitialSession,
  getAvailableMissions,
  getAvailableResearch,
  launchMission,
  recruitCrew,
  startResearch,
} from "../../src/domain/stellarCommandSession.js";

const fixedRoll = () => 0.01;

describe("stellar command session domain", () => {
  test("starts with playable missions, crew, and a computer rival", () => {
    const session = createInitialSession({ agencyName: "Test Agency" });

    expect(session.player.agencyName).toBe("Test Agency");
    expect(session.player.credits).toBeGreaterThan(0);
    expect(session.player.crew.length).toBeGreaterThanOrEqual(3);
    expect(getAvailableMissions(session).length).toBeGreaterThan(0);
    expect(session.rivals[0].agencyName).toBe("Nova Youth Space Club");
  });

  test("launching a mission spends credits and assigns crew", () => {
    const session = createInitialSession();
    const mission = getAvailableMissions(session).find((item) => item.crewRequired === 2);
    const crewIds = session.player.crew.slice(0, 2).map((crew) => crew.id);

    const next = launchMission(session, mission.id, crewIds, { rng: fixedRoll });

    expect(next.player.activeMissions).toHaveLength(1);
    expect(next.player.credits).toBe(session.player.credits - mission.cost);
    expect(next.player.crew.filter((crew) => crew.status === "assigned")).toHaveLength(2);
  });

  test("missions complete into score, science, reputation, and log entries", () => {
    const session = createInitialSession();
    const mission = getAvailableMissions(session).find((item) => item.duration <= 5);
    const crewIds = session.player.crew.slice(0, mission.crewRequired).map((crew) => crew.id);
    const launched = launchMission(session, mission.id, crewIds, { rng: fixedRoll });

    const completed = advanceDays(launched, mission.duration, { rng: fixedRoll });

    expect(completed.player.activeMissions).toHaveLength(0);
    expect(completed.player.completedMissions).toHaveLength(1);
    expect(completed.player.science).toBeGreaterThan(session.player.science);
    expect(completed.player.reputation).toBeGreaterThan(session.player.reputation);
    expect(completed.timeline[0].type).toBe("mission:completed");
  });

  test("research follows prerequisites and raises tech level after completion", () => {
    const session = createInitialSession();
    const available = getAvailableResearch(session);
    expect(available.map((research) => research.id)).toContain("basic_rockets");

    const researching = startResearch(session, "basic_rockets");
    const completed = advanceDays(researching, 10, { rng: fixedRoll });

    expect(completed.player.completedResearch).toContain("basic_rockets");
    expect(completed.player.techLevel).toBeGreaterThan(session.player.techLevel);
    expect(getAvailableResearch(completed).map((research) => research.id)).toContain("ion_drives");
  });

  test("recruiting is immutable and adds a useful new crew member", () => {
    const session = createInitialSession();
    const next = recruitCrew(session, "pilot");

    expect(next).not.toBe(session);
    expect(next.player.crew).toHaveLength(session.player.crew.length + 1);
    expect(next.player.credits).toBeLessThan(session.player.credits);
  });

  test("computer rival advances during single player turns", () => {
    const session = createInitialSession();
    const advanced = advanceDays(session, 30, { rng: fixedRoll });

    expect(advanced.rivals[0].score).toBeGreaterThan(session.rivals[0].score);
    expect(advanced.timeline.some((event) => event.actor === "rival")).toBe(true);
  });
});
