/**
 * AudioExample - Demonstration of AudioManager functionality
 *
 * This file shows how to use the AudioManager for games.
 * Include this in your HTML to see audio controls in action.
 */

import game from '../main.js';

/**
 * Create audio control interface using safe DOM methods
 */
function createAudioControls() {
  const controlsContainer = document.createElement('div');
  controlsContainer.id = 'audio-controls';
  controlsContainer.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px;
    border-radius: 5px;
    font-family: monospace;
    z-index: 1000;
    min-width: 200px;
  `;

  // Create title
  const title = document.createElement('h3');
  title.textContent = 'Audio Controls';
  title.style.cssText = 'margin: 0 0 10px 0;';
  controlsContainer.appendChild(title);

  // Create master volume control
  const masterVolumeDiv = document.createElement('div');
  masterVolumeDiv.style.cssText = 'margin: 5px 0;';

  const masterVolumeLabel = document.createElement('label');
  masterVolumeLabel.textContent = 'Master Volume: ';
  const masterVolumeDisplay = document.createElement('span');
  masterVolumeDisplay.id = 'master-volume-display';
  masterVolumeDisplay.textContent = '100%';
  masterVolumeLabel.appendChild(masterVolumeDisplay);

  const masterVolumeSlider = document.createElement('input');
  masterVolumeSlider.type = 'range';
  masterVolumeSlider.id = 'master-volume';
  masterVolumeSlider.min = '0';
  masterVolumeSlider.max = '100';
  masterVolumeSlider.value = '100';
  masterVolumeSlider.style.cssText = 'width: 100%;';

  masterVolumeDiv.appendChild(masterVolumeLabel);
  masterVolumeDiv.appendChild(document.createElement('br'));
  masterVolumeDiv.appendChild(masterVolumeSlider);
  controlsContainer.appendChild(masterVolumeDiv);

  // Create music volume control
  const musicVolumeDiv = document.createElement('div');
  musicVolumeDiv.style.cssText = 'margin: 5px 0;';

  const musicVolumeLabel = document.createElement('label');
  musicVolumeLabel.textContent = 'Music Volume: ';
  const musicVolumeDisplay = document.createElement('span');
  musicVolumeDisplay.id = 'music-volume-display';
  musicVolumeDisplay.textContent = '70%';
  musicVolumeLabel.appendChild(musicVolumeDisplay);

  const musicVolumeSlider = document.createElement('input');
  musicVolumeSlider.type = 'range';
  musicVolumeSlider.id = 'music-volume';
  musicVolumeSlider.min = '0';
  musicVolumeSlider.max = '100';
  musicVolumeSlider.value = '70';
  musicVolumeSlider.style.cssText = 'width: 100%;';

  musicVolumeDiv.appendChild(musicVolumeLabel);
  musicVolumeDiv.appendChild(document.createElement('br'));
  musicVolumeDiv.appendChild(musicVolumeSlider);
  controlsContainer.appendChild(musicVolumeDiv);

  // Create SFX volume control
  const sfxVolumeDiv = document.createElement('div');
  sfxVolumeDiv.style.cssText = 'margin: 5px 0;';

  const sfxVolumeLabel = document.createElement('label');
  sfxVolumeLabel.textContent = 'SFX Volume: ';
  const sfxVolumeDisplay = document.createElement('span');
  sfxVolumeDisplay.id = 'sfx-volume-display';
  sfxVolumeDisplay.textContent = '80%';
  sfxVolumeLabel.appendChild(sfxVolumeDisplay);

  const sfxVolumeSlider = document.createElement('input');
  sfxVolumeSlider.type = 'range';
  sfxVolumeSlider.id = 'sfx-volume';
  sfxVolumeSlider.min = '0';
  sfxVolumeSlider.max = '100';
  sfxVolumeSlider.value = '80';
  sfxVolumeSlider.style.cssText = 'width: 100%;';

  sfxVolumeDiv.appendChild(sfxVolumeLabel);
  sfxVolumeDiv.appendChild(document.createElement('br'));
  sfxVolumeDiv.appendChild(sfxVolumeSlider);
  controlsContainer.appendChild(sfxVolumeDiv);

  // Create mute button
  const muteDiv = document.createElement('div');
  muteDiv.style.cssText = 'margin: 10px 0;';

  const muteButton = document.createElement('button');
  muteButton.id = 'mute-toggle';
  muteButton.textContent = 'Mute All';
  muteButton.style.cssText = 'width: 100%; padding: 5px;';

  muteDiv.appendChild(muteButton);
  controlsContainer.appendChild(muteDiv);

  // Create sound effects section
  const sfxDiv = document.createElement('div');
  sfxDiv.style.cssText = 'margin: 10px 0;';

  const sfxTitle = document.createElement('h4');
  sfxTitle.textContent = 'Sound Effects:';
  sfxTitle.style.cssText = 'margin: 5px 0;';
  sfxDiv.appendChild(sfxTitle);

  const uiClickButton = document.createElement('button');
  uiClickButton.id = 'ui-click';
  uiClickButton.textContent = 'UI Click';
  uiClickButton.style.cssText = 'margin: 2px; padding: 3px 8px;';

  const successButton = document.createElement('button');
  successButton.id = 'success';
  successButton.textContent = 'Success';
  successButton.style.cssText = 'margin: 2px; padding: 3px 8px;';

  const errorButton = document.createElement('button');
  errorButton.id = 'error';
  errorButton.textContent = 'Error';
  errorButton.style.cssText = 'margin: 2px; padding: 3px 8px;';

  sfxDiv.appendChild(uiClickButton);
  sfxDiv.appendChild(successButton);
  sfxDiv.appendChild(errorButton);
  controlsContainer.appendChild(sfxDiv);

  // Create stats display
  const statsDiv = document.createElement('div');
  statsDiv.style.cssText = 'margin: 10px 0; font-size: 10px;';

  const contextDiv = document.createElement('div');
  contextDiv.textContent = 'Context: ';
  const contextState = document.createElement('span');
  contextState.id = 'audio-context-state';
  contextState.textContent = '-';
  contextDiv.appendChild(contextState);

  const effectsDiv = document.createElement('div');
  effectsDiv.textContent = 'Active Effects: ';
  const activeEffects = document.createElement('span');
  activeEffects.id = 'active-effects';
  activeEffects.textContent = '0';
  effectsDiv.appendChild(activeEffects);

  statsDiv.appendChild(contextDiv);
  statsDiv.appendChild(effectsDiv);
  controlsContainer.appendChild(statsDiv);

  document.body.appendChild(controlsContainer);
  return controlsContainer;
}

/**
 * Create start audio dialog using safe DOM methods
 */
function createStartAudioDialog() {
  const startMessage = document.createElement('div');
  startMessage.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    z-index: 2000;
    font-family: monospace;
  `;

  const title = document.createElement('h2');
  title.textContent = 'Click to Start Audio';

  const message = document.createElement('p');
  message.textContent = 'Web Audio API requires user interaction';

  const startButton = document.createElement('button');
  startButton.id = 'start-audio';
  startButton.textContent = 'Start Audio';
  startButton.style.cssText = 'padding: 10px 20px; font-size: 16px;';

  startMessage.appendChild(title);
  startMessage.appendChild(message);
  startMessage.appendChild(startButton);

  document.body.appendChild(startMessage);
  return startMessage;
}

/**
 * Setup audio control event listeners
 */
function setupAudioControls() {
  const audioManager = game.getAudioManager();
  if (!audioManager) {
    console.warn('AudioManager not available');
    return;
  }

  // Volume controls
  document.getElementById('master-volume').addEventListener('input', (e) => {
    const value = e.target.value / 100;
    audioManager.setMasterVolume(value);
    document.getElementById('master-volume-display').textContent = `${e.target.value}%`;
  });

  document.getElementById('music-volume').addEventListener('input', (e) => {
    const value = e.target.value / 100;
    audioManager.setMusicVolume(value);
    document.getElementById('music-volume-display').textContent = `${e.target.value}%`;
  });

  document.getElementById('sfx-volume').addEventListener('input', (e) => {
    const value = e.target.value / 100;
    audioManager.setSfxVolume(value);
    document.getElementById('sfx-volume-display').textContent = `${e.target.value}%`;
  });

  // Mute toggle
  document.getElementById('mute-toggle').addEventListener('click', () => {
    const isMuted = audioManager.toggleMute();
    document.getElementById('mute-toggle').textContent = isMuted ? 'Unmute All' : 'Mute All';
  });

  // Sound effect buttons
  document.getElementById('ui-click').addEventListener('click', async () => {
    await audioManager.createUIClickEffect();
  });

  document.getElementById('success').addEventListener('click', async () => {
    await audioManager.createSuccessEffect();
  });

  document.getElementById('error').addEventListener('click', async () => {
    await audioManager.createErrorEffect();
  });

  // Update stats display
  setInterval(() => {
    const stats = audioManager.getStats();
    document.getElementById('audio-context-state').textContent = stats.contextState;
    document.getElementById('active-effects').textContent = stats.activeEffects;
  }, 500);
}

/**
 * Initialize audio demo when game is ready
 */
function initializeAudioDemo() {
  // Wait for game to be ready
  const checkGameReady = () => {
    if (game.isRunning && game.getAudioManager()) {
      createAudioControls();
      setupAudioControls();

      // Add click-to-start message since Web Audio requires user interaction
      if (game.getAudioManager().contextState === 'suspended') {
        const startMessage = createStartAudioDialog();

        document.getElementById('start-audio').addEventListener('click', async () => {
          try {
            await game.getAudioManager().resumeContext();
            game.getAudioManager().startAmbientMusic();
            startMessage.remove();
          } catch (error) {
            console.error('Failed to start audio:', error);
          }
        });
      }

      console.log('Audio demo initialized');
    } else {
      setTimeout(checkGameReady, 100);
    }
  };

  checkGameReady();
}

// Initialize the demo when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAudioDemo);
} else {
  initializeAudioDemo();
}

export { createAudioControls, setupAudioControls, initializeAudioDemo };