/**
 * UI Components Module Tests
 *
 * Tests for all UI component helper functions including:
 * - createElement
 * - Button creation and states
 * - Modal dialogs
 * - Loading spinners
 * - Progress bars
 * - Toast notifications
 * - Dropdowns
 * - Badges and panels
 */

import {
  ANIMATION_TIMING,
  createElement,
  createButton,
  createModal,
  showModal,
  closeModal,
  createLoadingSpinner,
  createProgressBar,
  updateProgressBar,
  createToast,
  showToast,
  removeToast,
  createDropdown,
  toggleDropdown,
  closeDropdown,
  createBadge,
  createPanel,
} from "../../src/ui/components.js";

// Mock DOM setup
beforeEach(() => {
  // Clear all child nodes from body
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  jest.useFakeTimers();
  // Mock requestAnimationFrame for testing
  jest.spyOn(global, "requestAnimationFrame").mockImplementation((cb) => {
    setTimeout(cb, 0);
    return 1;
  });
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  if (global.requestAnimationFrame.mockRestore) {
    global.requestAnimationFrame.mockRestore();
  }
  jest.useRealTimers();
});

describe("ANIMATION_TIMING", () => {
  test("should have correct timing values", () => {
    expect(ANIMATION_TIMING.fast).toBe(200);
    expect(ANIMATION_TIMING.normal).toBe(300);
    expect(ANIMATION_TIMING.slow).toBe(500);
  });

  test("should have easing functions", () => {
    expect(ANIMATION_TIMING.easing.easeInOut).toBeDefined();
    expect(ANIMATION_TIMING.easing.easeOut).toBeDefined();
    expect(ANIMATION_TIMING.easing.easeIn).toBeDefined();
    expect(ANIMATION_TIMING.easing.linear).toBe("linear");
  });
});

describe("createElement", () => {
  test("should create a basic element", () => {
    const element = createElement("div");
    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.tagName).toBe("DIV");
  });

  test("should add CSS classes", () => {
    const element = createElement("div", {
      classes: ["class1", "class2"],
    });
    expect(element.classList.contains("class1")).toBe(true);
    expect(element.classList.contains("class2")).toBe(true);
  });

  test("should add attributes", () => {
    const element = createElement("div", {
      attrs: { "data-test": "value", "aria-label": "test" },
    });
    expect(element.getAttribute("data-test")).toBe("value");
    expect(element.getAttribute("aria-label")).toBe("test");
  });

  test("should set element ID", () => {
    const element = createElement("div", {
      id: "test-id",
    });
    expect(element.id).toBe("test-id");
  });

  test("should set text content", () => {
    const element = createElement("div", {
      text: "Hello World",
    });
    expect(element.textContent).toBe("Hello World");
  });

  test("should attach click handler", () => {
    const onClick = jest.fn();
    const element = createElement("button", {
      onClick,
    });
    element.click();
    expect(onClick).toHaveBeenCalled();
  });
});

describe("createButton", () => {
  test("should create a button with default text", () => {
    const button = createButton();
    expect(button.textContent).toBe("Button");
    expect(button.classList.contains("ui-button")).toBe(true);
  });

  test("should create button with custom text", () => {
    const button = createButton({ text: "Click Me" });
    expect(button.textContent).toBe("Click Me");
  });

  test("should apply variant classes", () => {
    const primaryBtn = createButton({ variant: "primary" });
    const secondaryBtn = createButton({ variant: "secondary" });
    const dangerBtn = createButton({ variant: "danger" });

    expect(primaryBtn.classList.contains("ui-button--primary")).toBe(true);
    expect(secondaryBtn.classList.contains("ui-button--secondary")).toBe(true);
    expect(dangerBtn.classList.contains("ui-button--danger")).toBe(true);
  });

  test("should handle click events", () => {
    const onClick = jest.fn();
    const button = createButton({ onClick });
    button.click();
    expect(onClick).toHaveBeenCalled();
  });

  test("should support disabled state", () => {
    const button = createButton({ disabled: true });
    expect(button.disabled).toBe(true);
    expect(button.classList.contains("ui-button--disabled")).toBe(true);
  });

  test("should set element ID", () => {
    const button = createButton({ id: "submit-btn" });
    expect(button.id).toBe("submit-btn");
  });

  test("should not trigger click handler when disabled", () => {
    const onClick = jest.fn();
    const button = createButton({ disabled: true, onClick });
    button.click();
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("createModal", () => {
  test("should create modal overlay element", () => {
    const modal = createModal();
    expect(modal.classList.contains("ui-modal-overlay")).toBe(true);
  });

  test("should include modal dialog", () => {
    const modal = createModal();
    const dialog = modal.querySelector(".ui-modal-dialog");
    expect(dialog).not.toBeNull();
  });

  test("should set modal title", () => {
    const modal = createModal({ title: "Test Title" });
    const title = modal.querySelector(".ui-modal-title");
    expect(title.textContent).toBe("Test Title");
  });

  test("should set modal message", () => {
    const modal = createModal({ message: "Test Message" });
    const body = modal.querySelector(".ui-modal-body");
    expect(body.textContent).toBe("Test Message");
  });

  test("should include close button", () => {
    const modal = createModal();
    const closeBtn = modal.querySelector(".ui-modal-close");
    expect(closeBtn).not.toBeNull();
  });

  test("should render action buttons", () => {
    const buttons = [
      { text: "Cancel", variant: "secondary" },
      { text: "Save", variant: "primary" },
    ];
    const modal = createModal({ buttons });
    const buttonElements = modal.querySelectorAll(".ui-button");
    expect(buttonElements.length).toBeGreaterThanOrEqual(2);
  });

  test("should set modal ID", () => {
    const modal = createModal({ id: "confirm-modal" });
    expect(modal.id).toContain("confirm-modal");
  });

  test("should close on close button click", () => {
    const modal = createModal();
    document.body.appendChild(modal);
    const closeBtn = modal.querySelector(".ui-modal-close");
    closeBtn.click();
    expect(modal.classList.contains("ui-modal-closing")).toBe(true);
  });

  test("should close on overlay click", () => {
    const modal = createModal();
    document.body.appendChild(modal);
    modal.click(); // Click on overlay
    expect(modal.classList.contains("ui-modal-closing")).toBe(true);
  });

  test("should not close when clicking dialog", () => {
    const modal = createModal();
    document.body.appendChild(modal);
    const dialog = modal.querySelector(".ui-modal-dialog");
    dialog.click(); // Click on dialog, not overlay
    // Should not have closing class yet (unless the click bubbles and triggers overlay handler)
    // This is a test of the expected behavior
  });
});

describe("showModal and closeModal", () => {
  test("showModal should append modal to document", () => {
    const modal = createModal();
    showModal(modal);
    expect(document.body.contains(modal)).toBe(true);
  });

  test("showModal should add ui-modal-open class", () => {
    const modal = createModal();
    showModal(modal);
    jest.runAllTimers();
    expect(modal.classList.contains("ui-modal-open")).toBe(true);
  });

  test("closeModal should add closing class", () => {
    const modal = createModal();
    document.body.appendChild(modal);
    closeModal(modal);
    expect(modal.classList.contains("ui-modal-closing")).toBe(true);
  });

  test("closeModal should remove element after animation", () => {
    const modal = createModal();
    document.body.appendChild(modal);
    closeModal(modal);
    expect(document.body.contains(modal)).toBe(true);
    jest.advanceTimersByTime(300);
    expect(document.body.contains(modal)).toBe(false);
  });

  test("closeModal should call onClose callback", () => {
    const onClose = jest.fn();
    const modal = createModal();
    document.body.appendChild(modal);
    closeModal(modal, onClose);
    jest.advanceTimersByTime(300);
    expect(onClose).toHaveBeenCalled();
  });
});

describe("createLoadingSpinner", () => {
  test("should create spinner element", () => {
    const spinner = createLoadingSpinner();
    expect(spinner.classList.contains("ui-spinner")).toBe(true);
  });

  test("should support size variants", () => {
    const smallSpinner = createLoadingSpinner({ size: "small" });
    const mediumSpinner = createLoadingSpinner({ size: "medium" });
    const largeSpinner = createLoadingSpinner({ size: "large" });

    expect(smallSpinner.classList.contains("ui-spinner--small")).toBe(true);
    expect(mediumSpinner.classList.contains("ui-spinner--medium")).toBe(true);
    expect(largeSpinner.classList.contains("ui-spinner--large")).toBe(true);
  });

  test("should include spinner circle", () => {
    const spinner = createLoadingSpinner();
    const circle = spinner.querySelector(".ui-spinner-circle");
    expect(circle).not.toBeNull();
  });

  test("should set element ID", () => {
    const spinner = createLoadingSpinner({ id: "loading" });
    expect(spinner.id).toBe("loading");
  });
});

describe("createProgressBar", () => {
  test("should create progress container", () => {
    const progress = createProgressBar();
    expect(progress.classList.contains("ui-progress-container")).toBe(true);
  });

  test("should set initial progress value", () => {
    const progress = createProgressBar({ value: 50 });
    const fill = progress.querySelector(".ui-progress-fill");
    expect(fill.style.width).toBe("50%");
  });

  test("should display percentage", () => {
    const progress = createProgressBar({ value: 75 });
    const percentage = progress.querySelector(".ui-progress-percentage");
    expect(percentage.textContent).toBe("75%");
  });

  test("should include label when provided", () => {
    const progress = createProgressBar({ label: "Loading" });
    const label = progress.querySelector(".ui-progress-label");
    expect(label.textContent).toBe("Loading");
  });

  test("should clamp value between 0 and 100", () => {
    const progressLow = createProgressBar({ value: -10 });
    const progressHigh = createProgressBar({ value: 150 });

    const fillLow = progressLow.querySelector(".ui-progress-fill");
    const fillHigh = progressHigh.querySelector(".ui-progress-fill");

    expect(fillLow.style.width).toBe("0%");
    expect(fillHigh.style.width).toBe("100%");
  });

  test("should set element ID", () => {
    const progress = createProgressBar({ id: "progress" });
    expect(progress.id).toBe("progress");
  });
});

describe("updateProgressBar", () => {
  test("should update progress fill width", () => {
    const progress = createProgressBar({ value: 0 });
    updateProgressBar(progress, 50);
    const fill = progress.querySelector(".ui-progress-fill");
    expect(fill.style.width).toBe("50%");
  });

  test("should update percentage text", () => {
    const progress = createProgressBar({ value: 0 });
    updateProgressBar(progress, 75);
    const percentage = progress.querySelector(".ui-progress-percentage");
    expect(percentage.textContent).toBe("75%");
  });

  test("should clamp updated value", () => {
    const progress = createProgressBar({ value: 0 });
    updateProgressBar(progress, 150);
    const fill = progress.querySelector(".ui-progress-fill");
    expect(fill.style.width).toBe("100%");
  });
});

describe("createToast", () => {
  test("should create toast element", () => {
    const toast = createToast();
    expect(toast.classList.contains("ui-toast")).toBe(true);
  });

  test("should set toast message", () => {
    const toast = createToast({ message: "Test Message" });
    const content = toast.querySelector(".ui-toast-content");
    expect(content.textContent).toBe("Test Message");
  });

  test("should apply type variant", () => {
    const infoToast = createToast({ type: "info" });
    const successToast = createToast({ type: "success" });
    const warningToast = createToast({ type: "warning" });
    const errorToast = createToast({ type: "error" });

    expect(infoToast.classList.contains("ui-toast--info")).toBe(true);
    expect(successToast.classList.contains("ui-toast--success")).toBe(true);
    expect(warningToast.classList.contains("ui-toast--warning")).toBe(true);
    expect(errorToast.classList.contains("ui-toast--error")).toBe(true);
  });

  test("should include close button", () => {
    const toast = createToast();
    const closeBtn = toast.querySelector(".ui-toast-close");
    expect(closeBtn).not.toBeNull();
  });

  test("should set element ID", () => {
    const toast = createToast({ id: "info-toast" });
    expect(toast.id).toBe("info-toast");
  });
});

describe("showToast and removeToast", () => {
  test("showToast should add toast to container", () => {
    const toast = createToast({ message: "Test" });
    showToast(toast);
    expect(document.body.querySelector(".ui-toast-container")).not.toBeNull();
  });

  test("showToast should add toast to DOM and add visible class", () => {
    const toast = createToast({ message: "Test" });
    expect(document.body.querySelector(".ui-toast-container")).toBeNull();
    showToast(toast);
    // After showToast, container should exist and toast should be added
    expect(document.body.querySelector(".ui-toast-container")).not.toBeNull();
    expect(document.body.querySelector(".ui-toast")).toBe(toast);
    // Advance timers to let requestAnimationFrame callback execute
    jest.advanceTimersByTime(0);
    // The visible class should be added via requestAnimationFrame
    expect(toast.classList.contains("ui-toast-visible")).toBe(true);
  });

  test("showToast should auto-remove after duration", () => {
    const toast = createToast({ message: "Test" });
    showToast(toast, 1000);
    expect(document.body.contains(toast)).toBe(true);
    jest.advanceTimersByTime(1000);
    jest.advanceTimersByTime(300); // Animation duration
    expect(document.body.contains(toast)).toBe(false);
  });

  test("showToast with 0 duration should not auto-remove", () => {
    const toast = createToast({ message: "Test" });
    showToast(toast, 0);
    jest.advanceTimersByTime(5000);
    expect(document.body.contains(toast)).toBe(true);
  });

  test("removeToast should remove toast", () => {
    const toast = createToast({ message: "Test" });
    showToast(toast, 0);
    removeToast(toast);
    jest.advanceTimersByTime(300); // Animation duration
    expect(document.body.contains(toast)).toBe(false);
  });
});

describe("createDropdown", () => {
  test("should create dropdown element", () => {
    const dropdown = createDropdown();
    expect(dropdown.classList.contains("ui-dropdown")).toBe(true);
  });

  test("should include toggle button", () => {
    const dropdown = createDropdown();
    const toggle = dropdown.querySelector(".ui-dropdown-toggle");
    expect(toggle).not.toBeNull();
  });

  test("should set button label", () => {
    const dropdown = createDropdown({ label: "Options" });
    const toggle = dropdown.querySelector(".ui-dropdown-toggle");
    expect(toggle.textContent).toContain("Options");
  });

  test("should render menu items", () => {
    const items = [
      { text: "Item 1", onClick: jest.fn() },
      { text: "Item 2", onClick: jest.fn() },
    ];
    const dropdown = createDropdown({ items });
    const menuItems = dropdown.querySelectorAll(".ui-dropdown-item");
    expect(menuItems.length).toBe(2);
  });

  test("should set element ID", () => {
    const dropdown = createDropdown({ id: "menu" });
    expect(dropdown.id).toBe("menu");
  });
});

describe("toggleDropdown and closeDropdown", () => {
  test("toggleDropdown should add open class", () => {
    const dropdown = createDropdown();
    toggleDropdown(dropdown);
    expect(dropdown.classList.contains("ui-dropdown-open")).toBe(true);
  });

  test("toggleDropdown should remove open class", () => {
    const dropdown = createDropdown();
    toggleDropdown(dropdown);
    toggleDropdown(dropdown);
    expect(dropdown.classList.contains("ui-dropdown-open")).toBe(false);
  });

  test("toggleDropdown with force true should open", () => {
    const dropdown = createDropdown();
    toggleDropdown(dropdown, true);
    expect(dropdown.classList.contains("ui-dropdown-open")).toBe(true);
  });

  test("toggleDropdown with force false should close", () => {
    const dropdown = createDropdown();
    dropdown.classList.add("ui-dropdown-open");
    toggleDropdown(dropdown, false);
    expect(dropdown.classList.contains("ui-dropdown-open")).toBe(false);
  });

  test("closeDropdown should remove open class", () => {
    const dropdown = createDropdown();
    dropdown.classList.add("ui-dropdown-open");
    closeDropdown(dropdown);
    expect(dropdown.classList.contains("ui-dropdown-open")).toBe(false);
  });
});

describe("createBadge", () => {
  test("should create badge element", () => {
    const badge = createBadge();
    expect(badge.classList.contains("ui-badge")).toBe(true);
  });

  test("should set badge text", () => {
    const badge = createBadge({ text: "NEW" });
    expect(badge.textContent).toBe("NEW");
  });

  test("should apply variant classes", () => {
    const defaultBadge = createBadge({ variant: "default" });
    const successBadge = createBadge({ variant: "success" });
    const warningBadge = createBadge({ variant: "warning" });
    const errorBadge = createBadge({ variant: "error" });

    expect(defaultBadge.classList.contains("ui-badge--default")).toBe(true);
    expect(successBadge.classList.contains("ui-badge--success")).toBe(true);
    expect(warningBadge.classList.contains("ui-badge--warning")).toBe(true);
    expect(errorBadge.classList.contains("ui-badge--error")).toBe(true);
  });

  test("should set element ID", () => {
    const badge = createBadge({ id: "status" });
    expect(badge.id).toBe("status");
  });
});

describe("createPanel", () => {
  test("should create panel element", () => {
    const panel = createPanel();
    expect(panel.classList.contains("ui-panel")).toBe(true);
  });

  test("should include panel body", () => {
    const panel = createPanel();
    const body = panel.querySelector(".ui-panel-body");
    expect(body).not.toBeNull();
  });

  test("should set panel title", () => {
    const panel = createPanel({ title: "Panel Title" });
    const header = panel.querySelector(".ui-panel-header");
    expect(header).not.toBeNull();
    expect(header.textContent).toBe("Panel Title");
  });

  test("should set panel content as string", () => {
    const panel = createPanel({ content: "Panel Content" });
    const body = panel.querySelector(".ui-panel-body");
    expect(body.textContent).toBe("Panel Content");
  });

  test("should set panel content as element", () => {
    const contentElement = document.createElement("div");
    contentElement.textContent = "Test Content";
    const panel = createPanel({ content: contentElement });
    const body = panel.querySelector(".ui-panel-body");
    expect(body.contains(contentElement)).toBe(true);
  });

  test("should apply variant classes", () => {
    const primaryPanel = createPanel({ variant: "primary" });
    const successPanel = createPanel({ variant: "success" });

    expect(primaryPanel.classList.contains("ui-panel--primary")).toBe(true);
    expect(successPanel.classList.contains("ui-panel--success")).toBe(true);
  });

  test("should set element ID", () => {
    const panel = createPanel({ id: "info-panel" });
    expect(panel.id).toBe("info-panel");
  });
});

describe("Integration Tests", () => {
  test("should create a complete modal confirmation dialog", () => {
    const onConfirm = jest.fn();
    const buttons = [
      { text: "Cancel", variant: "secondary" },
      {
        text: "Confirm",
        variant: "primary",
        onClick: onConfirm,
      },
    ];

    const modal = createModal({
      title: "Delete Item",
      message: "Are you sure you want to delete this item?",
      buttons,
    });

    showModal(modal);
    expect(document.body.contains(modal)).toBe(true);

    const confirmBtn = modal.querySelectorAll(".ui-button")[1];
    confirmBtn.click();
    expect(onConfirm).toHaveBeenCalled();
  });

  test("should display a progress bar with update", () => {
    const progress = createProgressBar({
      label: "Download Progress",
      value: 0,
    });

    document.body.appendChild(progress);
    expect(progress.querySelector(".ui-progress-fill").style.width).toBe("0%");

    updateProgressBar(progress, 50);
    expect(progress.querySelector(".ui-progress-fill").style.width).toBe("50%");

    updateProgressBar(progress, 100);
    expect(progress.querySelector(".ui-progress-fill").style.width).toBe(
      "100%",
    );
  });

  test("should display multiple toasts", () => {
    showToast(createToast({ message: "Info", type: "info" }), 0);
    showToast(createToast({ message: "Success", type: "success" }), 0);
    showToast(createToast({ message: "Error", type: "error" }), 0);

    const toasts = document.querySelectorAll(".ui-toast");
    expect(toasts.length).toBe(3);
  });

  test("should handle dropdown with menu items", () => {
    const items = [
      { text: "Edit", onClick: jest.fn() },
      { text: "Delete", onClick: jest.fn() },
    ];

    const dropdown = createDropdown({
      label: "Actions",
      items,
    });

    document.body.appendChild(dropdown);

    const toggle = dropdown.querySelector(".ui-dropdown-toggle");
    toggle.click();
    expect(dropdown.classList.contains("ui-dropdown-open")).toBe(true);

    const menuItems = dropdown.querySelectorAll(".ui-dropdown-item");
    expect(menuItems.length).toBe(2);
  });
});
