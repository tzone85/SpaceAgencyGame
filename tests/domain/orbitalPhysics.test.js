import {
  applyImpulse,
  createOrbitState,
  getOrbitTelemetry,
  projectOrbitPath,
  stepOrbit,
} from "../../src/domain/orbitalPhysics.js";

describe("orbital physics domain", () => {
  test("creates a stable starter orbit with useful telemetry", () => {
    const state = createOrbitState();
    const telemetry = getOrbitTelemetry(state);

    expect(telemetry.altitude).toBeGreaterThan(80);
    expect(telemetry.speed).toBeGreaterThan(2);
    expect(telemetry.eccentricity).toBeLessThan(0.05);
    expect(telemetry.status).toBe("stable");
  });

  test("stepping the orbit bends the craft without mutating the old state", () => {
    const state = createOrbitState();
    const next = stepOrbit(state, 0.2);

    expect(next).not.toBe(state);
    expect(next.position.y).toBeGreaterThan(state.position.y);
    expect(next.velocity.x).toBeLessThan(state.velocity.x);
    expect(state.elapsed).toBe(0);
  });

  test("prograde and retrograde impulses change orbital speed predictably", () => {
    const state = createOrbitState();
    const faster = applyImpulse(state, "prograde", 0.7);
    const slower = applyImpulse(state, "retrograde", 0.7);

    expect(getOrbitTelemetry(faster).speed).toBeGreaterThan(getOrbitTelemetry(state).speed);
    expect(getOrbitTelemetry(slower).speed).toBeLessThan(getOrbitTelemetry(state).speed);
  });

  test("projected path returns bounded future positions for the visualizer", () => {
    const state = createOrbitState();
    const path = projectOrbitPath(state, 24, 0.12);

    expect(path).toHaveLength(24);
    expect(path[0]).toEqual(expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }));
    expect(Math.hypot(path[10].x, path[10].y)).toBeGreaterThan(state.bodyRadius);
  });
});
