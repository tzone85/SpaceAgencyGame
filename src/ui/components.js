/**
 * UI Components Module
 *
 * Provides reusable UI component helpers for creating buttons, modals,
 * loading indicators, and other common UI elements with consistent
 * styling and animations.
 */

/**
 * Configuration for consistent animation timing
 */
const ANIMATION_TIMING = {
  fast: 200,      // ms
  normal: 300,    // ms
  slow: 500,      // ms
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    linear: 'linear',
  }
};

/**
 * Creates a DOM element with specified attributes and classes
 * @param {string} tag - HTML tag name
 * @param {Object} options - Configuration options
 * @param {string[]} options.classes - CSS classes to apply
 * @param {Object} options.attrs - HTML attributes
 * @param {string} options.id - Element ID
 * @param {string} options.text - Text content
 * @param {Function} options.onClick - Click event handler
 * @returns {HTMLElement} The created element
 */
function createElement(tag, options = {}) {
  const element = document.createElement(tag);

  if (options.id) {
    element.id = options.id;
  }

  if (options.classes) {
    element.classList.add(...options.classes);
  }

  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (options.text) {
    element.textContent = options.text;
  }

  if (options.onClick) {
    element.addEventListener('click', options.onClick);
  }

  return element;
}

/**
 * Creates a styled button element
 * @param {Object} options - Button configuration
 * @param {string} options.text - Button text
 * @param {Function} options.onClick - Click handler
 * @param {string} options.variant - Button style variant (primary, secondary, danger)
 * @param {string} options.id - Optional element ID
 * @param {boolean} options.disabled - Whether button is disabled
 * @returns {HTMLElement} The button element
 */
function createButton(options = {}) {
  const {
    text = 'Button',
    onClick = null,
    variant = 'primary',
    id = null,
    disabled = false
  } = options;

  const button = createElement('button', {
    classes: ['ui-button', `ui-button--${variant}`],
    text,
    id,
    onClick: disabled ? null : onClick
  });

  if (disabled) {
    button.disabled = true;
    button.classList.add('ui-button--disabled');
  }

  return button;
}

/**
 * Creates a modal dialog element
 * @param {Object} options - Modal configuration
 * @param {string} options.title - Modal title
 * @param {string} options.message - Modal message/content
 * @param {string} options.id - Modal ID
 * @param {Array<Object>} options.buttons - Array of button configs
 * @param {Function} options.onClose - Callback when modal closes
 * @returns {HTMLElement} The modal overlay element
 */
function createModal(options = {}) {
  const {
    title = 'Confirmation',
    message = '',
    id = 'modal-' + Date.now(),
    buttons = [
      { text: 'Cancel', variant: 'secondary' },
      { text: 'Confirm', variant: 'primary' }
    ],
    onClose = null
  } = options;

  const overlay = createElement('div', {
    classes: ['ui-modal-overlay'],
    id
  });

  const dialog = createElement('div', {
    classes: ['ui-modal-dialog']
  });

  // Modal header
  const header = createElement('div', {
    classes: ['ui-modal-header']
  });

  const titleEl = createElement('h2', {
    classes: ['ui-modal-title'],
    text: title
  });

  const closeBtn = createElement('button', {
    classes: ['ui-modal-close'],
    text: '×',
    onClick: () => closeModal(overlay, onClose)
  });

  header.appendChild(titleEl);
  header.appendChild(closeBtn);

  // Modal body
  const body = createElement('div', {
    classes: ['ui-modal-body'],
    text: message
  });

  // Modal footer with buttons
  const footer = createElement('div', {
    classes: ['ui-modal-footer']
  });

  buttons.forEach((btnConfig, index) => {
    const btn = createButton({
      text: btnConfig.text,
      variant: btnConfig.variant || 'secondary',
      onClick: () => {
        if (btnConfig.onClick) {
          btnConfig.onClick();
        }
        closeModal(overlay, onClose);
      }
    });
    footer.appendChild(btn);
  });

  dialog.appendChild(header);
  dialog.appendChild(body);
  dialog.appendChild(footer);

  overlay.appendChild(dialog);

  // Close on overlay click (outside dialog)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal(overlay, onClose);
    }
  });

  return overlay;
}

/**
 * Closes a modal with animation
 * @param {HTMLElement} modalOverlay - The modal overlay element
 * @param {Function} onClose - Optional callback
 */
function closeModal(modalOverlay, onClose = null) {
  modalOverlay.classList.add('ui-modal-closing');

  setTimeout(() => {
    modalOverlay.remove();
    if (onClose) {
      onClose();
    }
  }, ANIMATION_TIMING.normal);
}

/**
 * Shows a modal dialog
 * @param {HTMLElement} modal - The modal element
 */
function showModal(modal) {
  document.body.appendChild(modal);
  // Trigger animation by adding class after DOM insertion
  requestAnimationFrame(() => {
    modal.classList.add('ui-modal-open');
  });
}

/**
 * Creates a loading spinner indicator
 * @param {Object} options - Spinner configuration
 * @param {string} options.size - Size (small, medium, large)
 * @param {string} options.id - Optional element ID
 * @returns {HTMLElement} The spinner element
 */
function createLoadingSpinner(options = {}) {
  const {
    size = 'medium',
    id = null
  } = options;

  const spinner = createElement('div', {
    classes: ['ui-spinner', `ui-spinner--${size}`],
    id
  });

  const circle = createElement('div', {
    classes: ['ui-spinner-circle']
  });

  spinner.appendChild(circle);

  return spinner;
}

/**
 * Creates a progress indicator element
 * @param {Object} options - Progress configuration
 * @param {number} options.value - Current progress (0-100)
 * @param {string} options.label - Optional label text
 * @param {string} options.id - Optional element ID
 * @returns {HTMLElement} The progress element
 */
function createProgressBar(options = {}) {
  const {
    value = 0,
    label = null,
    id = null
  } = options;

  const container = createElement('div', {
    classes: ['ui-progress-container'],
    id
  });

  if (label) {
    const labelEl = createElement('div', {
      classes: ['ui-progress-label'],
      text: label
    });
    container.appendChild(labelEl);
  }

  const bar = createElement('div', {
    classes: ['ui-progress-bar']
  });

  const fill = createElement('div', {
    classes: ['ui-progress-fill']
  });

  fill.style.width = `${Math.min(100, Math.max(0, value))}%`;

  const percentage = createElement('span', {
    classes: ['ui-progress-percentage'],
    text: `${Math.round(value)}%`
  });

  bar.appendChild(fill);
  bar.appendChild(percentage);
  container.appendChild(bar);

  return container;
}

/**
 * Updates progress bar value
 * @param {HTMLElement} progressElement - The progress element
 * @param {number} newValue - New progress value (0-100)
 */
function updateProgressBar(progressElement, newValue) {
  const fill = progressElement.querySelector('.ui-progress-fill');
  const percentage = progressElement.querySelector('.ui-progress-percentage');

  if (fill) {
    fill.style.width = `${Math.min(100, Math.max(0, newValue))}%`;
  }

  if (percentage) {
    percentage.textContent = `${Math.round(newValue)}%`;
  }
}

/**
 * Creates a toast/notification element
 * @param {Object} options - Toast configuration
 * @param {string} options.message - Toast message
 * @param {string} options.type - Type (info, success, warning, error)
 * @param {number} options.duration - Duration in ms (0 = manual close)
 * @param {string} options.id - Optional element ID
 * @returns {HTMLElement} The toast element
 */
function createToast(options = {}) {
  const {
    message = '',
    type = 'info',
    duration = 3000,
    id = null
  } = options;

  const toast = createElement('div', {
    classes: ['ui-toast', `ui-toast--${type}`],
    id
  });

  const content = createElement('div', {
    classes: ['ui-toast-content'],
    text: message
  });

  const closeBtn = createElement('button', {
    classes: ['ui-toast-close'],
    text: '×',
    onClick: () => removeToast(toast)
  });

  toast.appendChild(content);
  toast.appendChild(closeBtn);

  return toast;
}

/**
 * Shows a toast notification
 * @param {HTMLElement} toast - The toast element
 * @param {number} duration - Duration in ms (0 = manual close)
 */
function showToast(toast, duration = 3000) {
  const container = getToastContainer();
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('ui-toast-visible');
  });

  if (duration > 0) {
    setTimeout(() => {
      removeToast(toast);
    }, duration);
  }
}

/**
 * Removes a toast notification
 * @param {HTMLElement} toast - The toast element
 */
function removeToast(toast) {
  toast.classList.remove('ui-toast-visible');

  setTimeout(() => {
    toast.remove();
  }, ANIMATION_TIMING.normal);
}

/**
 * Gets or creates the toast container
 * @returns {HTMLElement} The toast container
 */
function getToastContainer() {
  let container = document.getElementById('ui-toast-container');

  if (!container) {
    container = createElement('div', {
      classes: ['ui-toast-container'],
      id: 'ui-toast-container'
    });
    document.body.appendChild(container);
  }

  return container;
}

/**
 * Creates a dropdown menu element
 * @param {Object} options - Dropdown configuration
 * @param {string} options.label - Button label
 * @param {Array<Object>} options.items - Menu items with {text, onClick}
 * @param {string} options.id - Optional element ID
 * @returns {HTMLElement} The dropdown element
 */
function createDropdown(options = {}) {
  const {
    label = 'Menu',
    items = [],
    id = null
  } = options;

  const container = createElement('div', {
    classes: ['ui-dropdown'],
    id
  });

  const toggle = createElement('button', {
    classes: ['ui-dropdown-toggle'],
    text: label,
    onClick: () => toggleDropdown(container)
  });

  const menu = createElement('ul', {
    classes: ['ui-dropdown-menu']
  });

  items.forEach((item) => {
    const menuItem = createElement('li', {
      classes: ['ui-dropdown-item']
    });

    const link = createElement('button', {
      classes: ['ui-dropdown-link'],
      text: item.text,
      onClick: () => {
        if (item.onClick) {
          item.onClick();
        }
        toggleDropdown(container, false);
      }
    });

    menuItem.appendChild(link);
    menu.appendChild(menuItem);
  });

  container.appendChild(toggle);
  container.appendChild(menu);

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      closeDropdown(container);
    }
  });

  return container;
}

/**
 * Toggles dropdown visibility
 * @param {HTMLElement} dropdown - The dropdown element
 * @param {boolean} force - Force open (true) or closed (false)
 */
function toggleDropdown(dropdown, force = null) {
  const isOpen = dropdown.classList.contains('ui-dropdown-open');
  const shouldOpen = force !== null ? force : !isOpen;

  if (shouldOpen) {
    dropdown.classList.add('ui-dropdown-open');
  } else {
    dropdown.classList.remove('ui-dropdown-open');
  }
}

/**
 * Closes a dropdown
 * @param {HTMLElement} dropdown - The dropdown element
 */
function closeDropdown(dropdown) {
  dropdown.classList.remove('ui-dropdown-open');
}

/**
 * Creates a badge/tag element
 * @param {Object} options - Badge configuration
 * @param {string} options.text - Badge text
 * @param {string} options.variant - Style variant (default, success, warning, error)
 * @param {string} options.id - Optional element ID
 * @returns {HTMLElement} The badge element
 */
function createBadge(options = {}) {
  const {
    text = '',
    variant = 'default',
    id = null
  } = options;

  return createElement('span', {
    classes: ['ui-badge', `ui-badge--${variant}`],
    text,
    id
  });
}

/**
 * Creates a panel/card container
 * @param {Object} options - Panel configuration
 * @param {string} options.title - Panel title
 * @param {HTMLElement|string} options.content - Panel content
 * @param {string} options.variant - Style variant
 * @param {string} options.id - Optional element ID
 * @returns {HTMLElement} The panel element
 */
function createPanel(options = {}) {
  const {
    title = null,
    content = '',
    variant = 'default',
    id = null
  } = options;

  const panel = createElement('div', {
    classes: ['ui-panel', `ui-panel--${variant}`],
    id
  });

  if (title) {
    const header = createElement('div', {
      classes: ['ui-panel-header'],
      text: title
    });
    panel.appendChild(header);
  }

  const body = createElement('div', {
    classes: ['ui-panel-body']
  });

  if (typeof content === 'string') {
    body.textContent = content;
  } else if (content instanceof HTMLElement) {
    body.appendChild(content);
  }

  panel.appendChild(body);

  return panel;
}

/**
 * Creates an event notification card element
 * @param {Object} options - Event card configuration
 * @param {string} options.id - Event ID
 * @param {string} options.title - Event title
 * @param {string} options.description - Event description
 * @param {Array<Object>} options.choices - Array of choice objects with {id, text}
 * @param {Function} options.onChoice - Callback when choice is made with (eventId, choiceIndex)
 * @param {string} options.type - Event type (info, warning, danger, success)
 * @returns {HTMLElement} The event card element
 */
function createEventCard(options = {}) {
  const {
    id = '',
    title = 'Event',
    description = '',
    choices = [],
    onChoice = null,
    type = 'info'
  } = options;

  const card = createElement('div', {
    classes: ['ui-event-card', `ui-event-card--${type}`],
    id: `event-card-${id}`
  });

  // Header with title
  const header = createElement('div', {
    classes: ['ui-event-card-header']
  });

  const titleEl = createElement('h3', {
    classes: ['ui-event-card-title'],
    text: title
  });
  header.appendChild(titleEl);

  // Description
  const descEl = createElement('p', {
    classes: ['ui-event-card-description'],
    text: description
  });

  // Choices container
  const choicesContainer = createElement('div', {
    classes: ['ui-event-card-choices']
  });

  choices.forEach((choice, index) => {
    const btn = createButton({
      text: choice.text,
      variant: index === 0 ? 'primary' : 'secondary',
      onClick: () => {
        if (onChoice) {
          onChoice(id, index);
        }
      }
    });
    choicesContainer.appendChild(btn);
  });

  card.appendChild(header);
  card.appendChild(descEl);
  card.appendChild(choicesContainer);

  return card;
}

/**
 * Shows an event card notification
 * @param {HTMLElement} card - The event card element
 * @param {Function} onDismiss - Optional callback when card is dismissed
 */
function showEventCard(card, onDismiss = null) {
  const container = getEventCardContainer();
  container.appendChild(card);

  requestAnimationFrame(() => {
    card.classList.add('ui-event-card-visible');
  });
}

/**
 * Removes an event card notification
 * @param {HTMLElement} card - The event card element
 * @param {Function} onDismiss - Optional callback when dismissed
 */
function removeEventCard(card, onDismiss = null) {
  card.classList.remove('ui-event-card-visible');

  setTimeout(() => {
    card.remove();
    if (onDismiss) {
      onDismiss();
    }
  }, ANIMATION_TIMING.normal);
}

/**
 * Gets or creates the event card container
 * @returns {HTMLElement} The event card container
 */
function getEventCardContainer() {
  let container = document.getElementById('ui-event-card-container');

  if (!container) {
    container = createElement('div', {
      classes: ['ui-event-card-container'],
      id: 'ui-event-card-container'
    });
    document.body.appendChild(container);
  }

  return container;
}

export {
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
  createEventCard,
  showEventCard,
  removeEventCard,
  getEventCardContainer
};
