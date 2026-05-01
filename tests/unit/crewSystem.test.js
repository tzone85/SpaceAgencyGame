import CrewSystem from "../../src/systems/CrewSystem.js";
import EventBus from "../../src/game/EventBus.js";

describe("CrewSystem placeholder coverage", () => {
  test("constructs with an event bus", () => {
    const crewSystem = new CrewSystem(new EventBus());
    expect(crewSystem).toBeDefined();
    crewSystem.destroy?.();
  });
});
