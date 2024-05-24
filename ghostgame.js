const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 960;
canvas.height = 536;

// Player position
let playerX = canvas.width / 2;
let playerY = canvas.height / 2;

// Light beam properties
const lightRadius = 100; // Radius of the flashlight beam
const lightIntensity = 0.8; // Intensity of the light

// Background image
const backgroundImage = new Image();
backgroundImage.src = 'sppoky.jpg'; // Replace with the path to your image

// Funny man image
const funnyManImage = new Image();
funnyManImage.src = 'funny man.png'; // Replace with the path to your image
const funnyManWidth = 222;
const funnyManHeight = 333;
const funnyManX = 300; // Fixed X position for the funny man image
const funnyManY = 100; // Adjusted Y position for the funny man image

// Hand image
const handImage = new Image();
handImage.src = 'hand.png'; // Replace with the path to your image
const handWidth = 100;
const handHeight = 100;
const handX = canvas.width - handWidth - 90; // X position for the hand image
const handY = canvas.height - handHeight - 120; // Y position for the hand image

// Variables to track flashlight movement and time
let lastX = playerX;
let lastY = playerY;
let stationaryTime = 0;
const appearanceTime = 1000; // Time in milliseconds for the image to appear
let initialOpacity = 0.0; // Initial opacity for the hand image
let opacity = initialOpacity;

// Function to draw the background image
function drawBackground() {
    // Draw the background image
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Function to draw the light beam
function drawLight() {
    // Save the current canvas state
    ctx.save();

    // Draw the background image
    drawBackground();

    // Clip the drawing area to the shape of a circle centered at the player position
    ctx.beginPath();
    ctx.arc(playerX, playerY, lightRadius, 0, Math.PI * 2);
    ctx.clip();

    // Draw flashlight beam
    const gradient = ctx.createRadialGradient(playerX, playerY, 0, playerX, playerY, lightRadius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)'); // Transparent at center
    gradient.addColorStop(lightIntensity, 'rgba(255, 255, 255, 0.2)'); // Partially opaque around the player
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Transparent at edge
    ctx.fillStyle = gradient;

    // Draw the light beam
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Restore the previous canvas state
    ctx.restore();
}

// Function to check if any part of the flashlight is over the funny man area
function isPartiallyOverFunnyMan() {
    const dx = Math.abs(playerX - (funnyManX + funnyManWidth / 2));
    const dy = Math.abs(playerY - (funnyManY + funnyManHeight / 2));
    const halfWidth = funnyManWidth / 2;
    const halfHeight = funnyManHeight / 2;

    if (dx > (halfWidth + lightRadius) || dy > (halfHeight + lightRadius)) {
        return false;
    }

    if (dx <= halfWidth || dy <= halfHeight) {
        return true;
    }

    const cornerDistance_sq = (dx - halfWidth) ** 2 + (dy - halfHeight) ** 2;
    return cornerDistance_sq <= (lightRadius ** 2);
}

// Function to draw the funny man image
function drawFunnyMan() {
    if (opacity > 0) {
        ctx.globalAlpha = opacity;

        // Draw only the illuminated part of the funny man image
        ctx.save();
        ctx.beginPath();
        ctx.arc(playerX, playerY, lightRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(funnyManImage, funnyManX, funnyManY, funnyManWidth, funnyManHeight);
        ctx.restore();

        ctx.globalAlpha = 1; // Reset opacity
    }
}

// Function to update the opacity based on stationary time
function updateOpacity() {
    if (stationaryTime >= appearanceTime) {
        // Increase opacity gradually until slightly visible
        opacity = Math.min(0.2, (stationaryTime - appearanceTime) / 1000); // Very transparent, max 0.2 opacity
    } else {
        opacity = initialOpacity;
    }
}

// Function to redraw the canvas
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the light beam
    drawLight();

    // Draw the funny man image
    drawFunnyMan();

    // Update opacity for the hand image based on whether it's illuminated by the flashlight
    const handOpacity = isPartiallyOverHand() ? 0.15 : 0.0;

    // Draw the hand image
    ctx.globalAlpha = handOpacity; // Set transparency for the hand image
    ctx.drawImage(handImage, handX, handY, handWidth, handHeight);
    ctx.globalAlpha = 1; // Reset transparency

    // Update opacity based on stationary time
    updateOpacity();
}

// Function to check if any part of the flashlight is over the hand area
function isPartiallyOverHand() {
    const dx = Math.abs(playerX - (handX + handWidth / 2));
    const dy = Math.abs(playerY - (handY + handHeight / 2));
    const halfWidth = handWidth / 2;
    const halfHeight = handHeight / 2;

    if (dx > (halfWidth + lightRadius) || dy > (halfHeight + lightRadius)) {
        return false;
    }

    if (dx <= halfWidth || dy <= halfHeight) {
        return true;
    }
    
    const cornerDistance_sq = (dx - halfWidth) ** 2 + (dy - halfHeight) ** 2;
    return cornerDistance_sq <= (lightRadius ** 2);
}

// Arrow key event listeners
document.addEventListener('keydown', function(event) {
    let moved = false;

    if (event.key === 'ArrowLeft') {
        playerX -= 10; // Move left
        moved = true;
    } else if (event.key === 'ArrowRight') {
        playerX += 10; // Move right
        moved = true;
    } else if (event.key === 'ArrowUp') {
        playerY -= 10; // Move up
        moved = true;
    } else if (event.key === 'ArrowDown') {
        playerY += 10; // Move down
        moved = true;
    }

    if (moved) {
        // Check if player moved
        if (playerX !== lastX || playerY !== lastY) {
            stationaryTime = 0;
            lastX = playerX;
            lastY = playerY;
        }

        // Prevent default scrolling behavior
        event.preventDefault();

        // Redraw the canvas
        draw();
    }
});

// Track stationary time
setInterval(() => {
    if (playerX === lastX && playerY === lastY && isPartiallyOverFunnyMan()) {
        stationaryTime += 100;
    } else {
        stationaryTime = 0;
        lastX = playerX;
        lastY = playerY;
    }

    // Redraw the canvas
    draw();
}, 100);

// Initial draw
draw();
