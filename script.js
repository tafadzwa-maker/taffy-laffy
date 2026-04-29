// Get references to the video element and the button
const video = document.getElementById('bgVideo');
const muteButton = document.getElementById('muteBtn');

// Variable to track mute state (initially true because video starts with muted attribute)
let isMuted = true;

// Function to toggle sound
function toggleMute() {
    if (isMuted) {
        video.muted = false;
        muteButton.textContent = '🔊 Unmute';
        muteButton.style.backgroundColor = '#4caf50'; // greenish tone when sound is on
        isMuted = false;
    } else {
        video.muted = true;
        muteButton.textContent = '🔊 Mute';
        muteButton.style.backgroundColor = '#ff6b6b';
        isMuted = true;
    }
}

// Add event listener to the button
muteButton.addEventListener('click', toggleMute);

// Optional: If the video fails to autoplay due to browser policies, you can catch the error
video.addEventListener('play', () => {
    console.log('Video is playing');
});

video.addEventListener('error', () => {
    console.warn('Video failed to load. Check your video source.');
});