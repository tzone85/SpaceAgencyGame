import LaunchSequence from "../../src/scenes/LaunchSequence.js";

describe("Launch Sequence Scene", () => {
  test("should export LaunchSequence class", () => {
    expect(LaunchSequence).toBeDefined();
    expect(typeof LaunchSequence).toBe("function");
  });

  test("should require engine parameter", () => {
    expect(() => new LaunchSequence()).toThrow(
      "Engine is required for LaunchSequence initialization"
    );
  });
});
