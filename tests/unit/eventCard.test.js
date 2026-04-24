/**
 * Event Card Component Tests
 *
 * Tests for event card UI creation and display
 */

import {
  createEventCard,
  showEventCard,
  removeEventCard,
  getEventCardContainer,
} from "../../src/ui/components.js";

describe("Event Card Component", () => {
  beforeEach(() => {
    // Clean up any existing containers
    const container = document.getElementById("ui-event-card-container");
    if (container) {
      container.remove();
    }
  });

  afterEach(() => {
    // Clean up after each test
    const container = document.getElementById("ui-event-card-container");
    if (container) {
      container.remove();
    }
  });

  describe("createEventCard", () => {
    it("should create an event card element", () => {
      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test description",
        choices: [
          { id: "choice1", text: "Option 1" },
          { id: "choice2", text: "Option 2" },
        ],
      });

      expect(card).toBeInstanceOf(HTMLElement);
      expect(card.classList.contains("ui-event-card")).toBe(true);
    });

    it("should include the event title", () => {
      const card = createEventCard({
        id: "test_event",
        title: "Test Event Title",
        description: "Test description",
        choices: [],
      });

      const title = card.querySelector(".ui-event-card-title");
      expect(title).not.toBeNull();
      expect(title.textContent).toBe("Test Event Title");
    });

    it("should include the event description", () => {
      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test event description",
        choices: [],
      });

      const description = card.querySelector(".ui-event-card-description");
      expect(description).not.toBeNull();
      expect(description.textContent).toBe("Test event description");
    });

    it("should create choice buttons", () => {
      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [
          { id: "choice1", text: "Accept" },
          { id: "choice2", text: "Decline" },
        ],
      });

      const buttons = card.querySelectorAll("button");
      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent).toBe("Accept");
      expect(buttons[1].textContent).toBe("Decline");
    });

    it("should set event type variant", () => {
      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [],
        type: "warning",
      });

      expect(card.classList.contains("ui-event-card--warning")).toBe(true);
    });

    it("should call onChoice callback when button clicked", () => {
      const onChoice = jest.fn();
      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [
          { id: "choice1", text: "Accept" },
          { id: "choice2", text: "Decline" },
        ],
        onChoice,
      });

      const buttons = card.querySelectorAll("button");
      buttons[0].click();

      expect(onChoice).toHaveBeenCalledWith("test_event", 0);
    });

    it("should create card with default type", () => {
      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [],
      });

      expect(card.classList.contains("ui-event-card--info")).toBe(true);
    });

    it("should handle multiple choice buttons", () => {
      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [
          { id: "choice1", text: "Option 1" },
          { id: "choice2", text: "Option 2" },
          { id: "choice3", text: "Option 3" },
        ],
      });

      const buttons = card.querySelectorAll(".ui-event-card-choices button");
      expect(buttons.length).toBe(3);
    });
  });

  describe("showEventCard", () => {
    it("should add card to container", () => {
      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [],
      });

      showEventCard(card);

      const container = document.getElementById("ui-event-card-container");
      expect(container).not.toBeNull();
      expect(container.contains(card)).toBe(true);
    });

    it("should add visible class after showing", (done) => {
      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [],
      });

      showEventCard(card);

      requestAnimationFrame(() => {
        expect(card.classList.contains("ui-event-card-visible")).toBe(true);
        done();
      });
    });

    it("should create container if it doesn't exist", () => {
      let container = document.getElementById("ui-event-card-container");
      expect(container).toBeNull();

      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [],
      });
      showEventCard(card);

      container = document.getElementById("ui-event-card-container");
      expect(container).not.toBeNull();
    });
  });

  describe("removeEventCard", () => {
    it("should remove visible class", (done) => {
      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [],
      });

      showEventCard(card);

      requestAnimationFrame(() => {
        expect(card.classList.contains("ui-event-card-visible")).toBe(true);

        removeEventCard(card);
        expect(card.classList.contains("ui-event-card-visible")).toBe(false);
        done();
      });
    });

    it("should call dismiss callback after animation", (done) => {
      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [],
      });

      showEventCard(card);

      const onDismiss = jest.fn();
      removeEventCard(card, onDismiss);

      setTimeout(() => {
        expect(onDismiss).toHaveBeenCalled();
        done();
      }, 350);
    });

    it("should remove card from DOM", (done) => {
      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [],
      });

      showEventCard(card);
      const cardId = card.id;

      removeEventCard(card);

      setTimeout(() => {
        const removedCard = document.getElementById(cardId);
        expect(removedCard).toBeNull();
        done();
      }, 350);
    });
  });

  describe("getEventCardContainer", () => {
    it("should return existing container", () => {
      const container1 = getEventCardContainer();
      const container2 = getEventCardContainer();

      expect(container1).toBe(container2);
    });

    it("should create container if it doesn't exist", () => {
      let container = document.getElementById("ui-event-card-container");
      if (container) {
        container.remove();
      }

      const newContainer = getEventCardContainer();
      expect(newContainer).not.toBeNull();
      expect(newContainer.id).toBe("ui-event-card-container");
      expect(newContainer.classList.contains("ui-event-card-container")).toBe(
        true
      );
    });

    it("should append container to body", () => {
      const container = getEventCardContainer();
      expect(document.body.contains(container)).toBe(true);
    });
  });

  describe("Event Card Integration", () => {
    it("should display and remove event card", (done) => {
      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test description",
        choices: [
          { id: "choice1", text: "Accept" },
          { id: "choice2", text: "Decline" },
        ],
      });

      showEventCard(card);

      requestAnimationFrame(() => {
        expect(card.classList.contains("ui-event-card-visible")).toBe(true);

        removeEventCard(card);

        setTimeout(() => {
          expect(card.classList.contains("ui-event-card-visible")).toBe(false);
          done();
        }, 350);
      });
    });

    it("should handle choice callback and removal", (done) => {
      const onChoice = jest.fn();
      const card = createEventCard({
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [
          { id: "choice1", text: "Accept" },
          { id: "choice2", text: "Decline" },
        ],
        onChoice,
      });

      showEventCard(card);

      const buttons = card.querySelectorAll("button");
      buttons[0].click();

      expect(onChoice).toHaveBeenCalledWith("test_event", 0);

      removeEventCard(card);

      setTimeout(() => {
        expect(card.parentNode).toBeNull();
        done();
      }, 350);
    });
  });
});
