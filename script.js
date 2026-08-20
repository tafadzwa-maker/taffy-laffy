let score = 0;
        const totalQuestions = 3;
        let answered = 0;

        const buttons = document.querySelectorAll('.answer-btn');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.disabled) return;

                const isCorrect = button.getAttribute('data-correct') === 'true';
                if (isCorrect) {
                    score++;
                    document.getElementById('score').innerText = score;
                }

                const questionDiv = button.parentElement;
                const btnsInQuestion = questionDiv.querySelectorAll('.answer-btn');
                btnsInQuestion.forEach(btn => btn.disabled = true);

                answered++;
                if (answered === totalQuestions) {
                    alert('Quiz complete! Your final score: ' + score + '/' + totalQuestions);
                }
            });
        });

// Get references to the video element and the button
const video = document.getElementById('bgVideo');
const muteButton = document.getElementById('muteBtn');

// Variable to track mute state (initially true because video starts with muted attribute)
let isMuted = true;




// Add event listener to the button
muteButton.addEventListener('click', toggleMute);

// Optional: If the video fails to autoplay due to browser policies, you can catch the error
video.addEventListener('play', () => {
    console.log('Video is playing');
});

video.addEventListener('error', () => {
    console.warn('Video failed to load. Check your video source.');
});

// --- Reporting / Map / Sidebar functionality ---
let mapInitialized = false;
let map, marker, selectedType = null;

const reportBtn = document.getElementById('reportBtn');
const reportModal = document.getElementById('reportModal');
const closeModal = document.getElementById('closeModal');
const reportTypeButtons = document.querySelectorAll('#reportTypes button');
const selectedTypeElem = document.getElementById('selectedType');
const useCurrent = document.getElementById('useCurrent');
const clearMarker = document.getElementById('clearMarker');
const submitReport = document.getElementById('submitReport');

function openModal() {
    // kept for backward compatibility if modal exists
    reportModal.style.display = 'flex';
    if (!mapInitialized) initMap();
}

// Try to show user's current location when modal opens
function tryShowCurrentOnOpen() {
    if (!navigator.geolocation) return;
    // Only attempt if no marker yet
    if (marker) return;
    navigator.geolocation.getCurrentPosition(pos => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        // ensure map is ready
        if (mapInitialized) {
            placeMarker(latlng);
            map.setView(latlng, 16);
        }
    }, () => {});
}

function closeModalFn() {
    reportModal.style.display = 'none';
}

// When on the homepage, take user to full page map reporting UI.
reportBtn.addEventListener('click', () => { window.location.href = 'map.html'; });
closeModal.addEventListener('click', closeModalFn);
reportModal.addEventListener('click', (e) => { if (e.target===reportModal) closeModalFn(); });

reportTypeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedType = btn.getAttribute('data-type');
        selectedTypeElem.innerText = selectedType;
    });
});

function initMap() {
    mapInitialized = true;
    map = L.map('map').setView([20,0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', (e) => {
        placeMarker(e.latlng);
    });
    // Fix size when placed inside a modal
    setTimeout(() => { try { map.invalidateSize(); } catch(e){} }, 200);
    // Try to show current location automatically
    tryShowCurrentOnOpen();
}

function placeMarker(latlng) {
    // normalize latlng: accept array [lat,lng] or object {lat,lng}
    let ll = latlng;
    if (Array.isArray(latlng)) ll = L.latLng(latlng[0], latlng[1]);
    if (ll && ll.lat === undefined && ll.lat !== 0) return;
    if (marker) marker.setLatLng(ll);
    else marker = L.marker(ll, {draggable:true}).addTo(map);
    map.setView(ll, 16);
    marker.on('dragend', () => {});
}

useCurrent.addEventListener('click', () => {
    if (!navigator.geolocation) { alert('Geolocation supported'); return; }
    navigator.geolocation.getCurrentPosition(pos => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        placeMarker(latlng);
    }, err => { alert('Unable to retrieve location'); });
});

clearMarker.addEventListener('click', () => { if (marker) { map.removeLayer(marker); marker = null; } });

submitReport.addEventListener('click', () => {
    const title = document.getElementById('title').value.trim();
    const desc = document.getElementById('desc').value.trim();
    const reporter = document.getElementById('reporter').value.trim();
    if (!selectedType) { alert('Please choose a report type'); return; }
    if (!marker) { alert('Please select a location on the map or use current location'); return; }
    const latlng = marker.getLatLng();
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    reports.push({ type: selectedType, title, desc, reporter, lat: latlng.lat, lng: latlng.lng, ts: Date.now() });
    localStorage.setItem('reports', JSON.stringify(reports));
    const msg = document.getElementById('submitMsg'); msg.style.display='block';
    setTimeout(() => { msg.style.display='none'; closeModalFn(); }, 1200);
});
