// DOM Elements
const textInput = document.getElementById('textInput');
const displayText = document.getElementById('displayText');
const displayArea = document.getElementById('displayArea');
const bgColorInput = document.getElementById('bgColor');
const textColorInput = document.getElementById('textColor');
const flashingToggle = document.getElementById('flashingToggle');
const autoColorToggle = document.getElementById('autoColorToggle');
const flashSpeed = document.getElementById('flashSpeed');
const speedValue = document.getElementById('speedValue');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const speedGroup = document.getElementById('speedGroup');
const settingsToggle = document.getElementById('settingsToggle');
const controlsPanel = document.getElementById('controlsPanel');

let bgAutoColorTimer = null;
let textAutoColorTimer = null;

// Curated accessible color pairs [background, text] with WCAG AA+ contrast
const accessiblePalettes = [
    ['#1a1a2e', '#e0e0ff'],  // deep navy / soft lavender
    ['#0d0d0d', '#00e5ff'],  // near black / electric cyan
    ['#1b0030', '#ff6fff'],  // dark purple / hot pink
    ['#002b36', '#93a1a1'],  // solarized dark / solarized light
    ['#0a192f', '#64ffda'],  // midnight blue / mint
    ['#2d1b69', '#ffd700'],  // indigo / gold
    ['#1a0000', '#ff6b6b'],  // dark red / coral
    ['#003300', '#7fff7f'],  // dark green / lime
    ['#0b0c10', '#66fcf1'],  // charcoal / teal glow
    ['#1c1c1c', '#f5a623'],  // jet black / warm amber
    ['#f5f0e1', '#1a1a2e'],  // warm cream / deep navy
    ['#fff8dc', '#8b0000'],  // cornsilk / dark red
    ['#fdf6e3', '#268bd2'],  // solarized light / blue
    ['#f0f4ff', '#5b21b6'],  // icy white / vivid purple
    ['#fffbeb', '#b45309'],  // warm white / burnt orange
    ['#ff5722', '#ffffff'],  // deep orange / white
    ['#e91e63', '#ffffff'],  // pink / white
    ['#00695c', '#e0f2f1'],  // teal / pale teal
    ['#4a148c', '#e1bee7'],  // deep purple / light purple
    ['#006064', '#b2ebf2'],  // dark cyan / light cyan
];

// Initialize with random accessible colors
function initializeColors() {
    const palette = accessiblePalettes[Math.floor(Math.random() * accessiblePalettes.length)];
    const bgHex = palette[0];
    const textHex = palette[1];

    displayArea.style.backgroundColor = bgHex;
    displayText.style.color = textHex;
    bgColorInput.value = bgHex;
    textColorInput.value = textHex;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeColors();
    updateFlashingState();
    updateSpeedDisplay();
});

// Event Listeners
textInput.addEventListener('input', (e) => {
    displayText.textContent = e.target.value || 'Show me';
});

bgColorInput.addEventListener('input', (e) => {
    displayArea.style.backgroundColor = e.target.value;
});

textColorInput.addEventListener('input', (e) => {
    displayText.style.color = e.target.value;
});

flashingToggle.addEventListener('change', updateFlashingState);
autoColorToggle.addEventListener('change', updateAutoColorState);

flashSpeed.addEventListener('input', (e) => {
    updateFlashingState();
    updateSpeedDisplay();
});

fullscreenBtn.addEventListener('click', toggleFullscreen);

settingsToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = controlsPanel.style.display === 'none';
    controlsPanel.style.display = isOpen ? 'block' : 'none';
    
    // Toggle icons and active state
    document.getElementById('gearIcon').style.display = isOpen ? 'none' : 'block';
    document.getElementById('closeIcon').style.display = isOpen ? 'block' : 'none';
    settingsToggle.classList.toggle('active', isOpen);
});

document.addEventListener('click', (e) => {
    if (controlsPanel.style.display !== 'none' && !controlsPanel.contains(e.target) && !settingsToggle.contains(e.target)) {
        controlsPanel.style.display = 'none';
        // Reset icons and active state when closing via outside click
        document.getElementById('gearIcon').style.display = 'block';
        document.getElementById('closeIcon').style.display = 'none';
        settingsToggle.classList.remove('active');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        controlsPanel.style.display = 'none';
        settingsToggle.classList.remove('active');
        document.getElementById('gearIcon').style.display = 'block';
        document.getElementById('closeIcon').style.display = 'none';
        exitFullscreen();
    }
});

// Functions
function generateAccessibleColor() {
    // Generate colors that are reasonably bright and saturated for better visibility
    const hue = Math.random() * 360;
    const saturation = 60 + Math.random() * 40; // 60-100%
    const lightness = 40 + Math.random() * 30; // 40-70%
    return hslToRgb(hue, saturation, lightness);
}

function generateContrastingColor(bgColor) {
    // Determine if background is light or dark
    const rgb = parseColor(bgColor);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    
    // If background is dark, use light text; if light, use dark text
    if (brightness < 128) {
        // Dark background - use light text
        return { r: 255, g: 255, b: 255 };
    } else {
        // Light background - use dark text
        return { r: 0, g: 0, b: 0 };
    }
}

function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
        r: Math.round(255 * f(0)),
        g: Math.round(255 * f(8)),
        b: Math.round(255 * f(4))
    };
}

function parseColor(color) {
    if (color.startsWith('#')) {
        const hex = color.substring(1);
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    } else if (color.startsWith('rgb')) {
        const match = color.match(/\d+/g);
        return {
            r: parseInt(match[0]),
            g: parseInt(match[1]),
            b: parseInt(match[2])
        };
    }
    return { r: 0, g: 102, b: 255 };
}

function rgbToHex(rgb) {
    const toHex = n => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function updateFlashingState() {
    const isFlashing = flashingToggle.checked;
    speedGroup.style.display = isFlashing ? 'flex' : 'none';

    // Remove all animation classes
    displayArea.classList.remove('flashing', 'flashing-fast', 'flashing-slow');

    if (isFlashing) {
        const speed = parseFloat(flashSpeed.value);
        if (speed < 0.8) {
            displayArea.classList.add('flashing-slow');
        } else if (speed > 1.2) {
            displayArea.classList.add('flashing-fast');
        } else {
            displayArea.classList.add('flashing');
        }
    }
}

function updateSpeedDisplay() {
    const speed = parseFloat(flashSpeed.value);
    speedValue.textContent = speed.toFixed(1) + 'x';
}

function getRandomColor() {
    const color = generateAccessibleColor();
    return rgbToHex(color);
}

function scheduleBackgroundAutoColor() {
    const nextColor = getRandomColor();
    displayArea.style.backgroundColor = nextColor;
    bgColorInput.value = nextColor;
    
    // Update text color for contrast
    const textColor = generateContrastingColor(nextColor);
    displayText.style.color = rgbToHex(textColor);
    textColorInput.value = rgbToHex(textColor);

    const nextDelay = 900 + Math.floor(Math.random() * 1200);
    bgAutoColorTimer = setTimeout(scheduleBackgroundAutoColor, nextDelay);
}

function scheduleTextAutoColor() {
    const nextColor = getRandomColor();
    displayText.style.color = nextColor;
    textColorInput.value = nextColor;

    const nextDelay = 700 + Math.floor(Math.random() * 1400);
    textAutoColorTimer = setTimeout(scheduleTextAutoColor, nextDelay);
}

function stopAutoColorTimers() {
    if (bgAutoColorTimer) {
        clearTimeout(bgAutoColorTimer);
        bgAutoColorTimer = null;
    }

    if (textAutoColorTimer) {
        clearTimeout(textAutoColorTimer);
        textAutoColorTimer = null;
    }
}

function updateAutoColorState() {
    const isAutoColor = autoColorToggle.checked;
    bgColorInput.disabled = isAutoColor;
    textColorInput.disabled = isAutoColor;

    stopAutoColorTimers();

    if (isAutoColor) {
        scheduleBackgroundAutoColor();
        scheduleTextAutoColor();
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
            console.log('Fullscreen request failed:', err);
            // Fallback: add CSS fullscreen class
            document.body.classList.add('fullscreen');
        });
    } else {
        exitFullscreen();
    }
}

function exitFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    document.body.classList.remove('fullscreen');
}

// Handle fullscreen changes
document.addEventListener('fullscreenchange', () => {
    document.body.classList.toggle('fullscreen');
});

// Ensure a clean state on load
updateAutoColorState();

// Functions
function updateFlashingState() {
    const isFlashing = flashingToggle.checked;
    speedGroup.style.display = isFlashing ? 'flex' : 'none';

    // Remove all animation classes
    displayArea.classList.remove('flashing', 'flashing-fast', 'flashing-slow');

    if (isFlashing) {
        const speed = parseFloat(flashSpeed.value);
        if (speed < 0.8) {
            displayArea.classList.add('flashing-slow');
        } else if (speed > 1.2) {
            displayArea.classList.add('flashing-fast');
        } else {
            displayArea.classList.add('flashing');
        }
    }
}

function updateSpeedDisplay() {
    const speed = parseFloat(flashSpeed.value);
    speedValue.textContent = speed.toFixed(1) + 'x';
}

function getRandomColor() {
    const value = Math.floor(Math.random() * 0x1000000);
    return `#${value.toString(16).padStart(6, '0')}`;
}

function scheduleBackgroundAutoColor() {
    const nextColor = getRandomColor();
    displayArea.style.backgroundColor = nextColor;
    bgColorInput.value = nextColor;

    const nextDelay = 900 + Math.floor(Math.random() * 1200);
    bgAutoColorTimer = setTimeout(scheduleBackgroundAutoColor, nextDelay);
}

function scheduleTextAutoColor() {
    const nextColor = getRandomColor();
    displayText.style.color = nextColor;
    textColorInput.value = nextColor;

    const nextDelay = 700 + Math.floor(Math.random() * 1400);
    textAutoColorTimer = setTimeout(scheduleTextAutoColor, nextDelay);
}

function stopAutoColorTimers() {
    if (bgAutoColorTimer) {
        clearTimeout(bgAutoColorTimer);
        bgAutoColorTimer = null;
    }

    if (textAutoColorTimer) {
        clearTimeout(textAutoColorTimer);
        textAutoColorTimer = null;
    }
}

function updateAutoColorState() {
    const isAutoColor = autoColorToggle.checked;
    bgColorInput.disabled = isAutoColor;
    textColorInput.disabled = isAutoColor;

    stopAutoColorTimers();

    if (isAutoColor) {
        scheduleBackgroundAutoColor();
        scheduleTextAutoColor();
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
            console.log('Fullscreen request failed:', err);
            // Fallback: add CSS fullscreen class
            document.body.classList.add('fullscreen');
        });
    } else {
        exitFullscreen();
    }
}

function exitFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    document.body.classList.remove('fullscreen');
}

// Handle fullscreen changes
document.addEventListener('fullscreenchange', () => {
    document.body.classList.toggle('fullscreen');
});

// Ensure a clean state on load
updateAutoColorState();
