// --- Quiz Functionality ---
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
            const scoreElem = document.getElementById('score');
            if (scoreElem) scoreElem.innerText = score;
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

// --- Background Video Control ---
const video = document.getElementById('bgVideo');
const muteButton = document.getElementById('muteBtn');
let isMuted = true;

function toggleMute() {
    if (!video || !muteButton) return;
    if (isMuted) {
        video.muted = false;
        muteButton.textContent = '🔊 Unmute';
        muteButton.style.backgroundColor = '#4caf50'; 
        isMuted = false;
    } else {
        video.muted = true;
        muteButton.textContent = '🔊 Mute';
        muteButton.style.backgroundColor = '#ff6b6b';
        isMuted = true;
    }
}

// FIXED: Added safety check to prevent crash if mute button is absent in HTML
if (muteButton) {
    muteButton.addEventListener('click', toggleMute);
}

if (video) {
    video.addEventListener('play', () => {
        console.log('Video is playing');
    });

    video.addEventListener('error', () => {
        console.warn('Video failed to load. Check your video source.');
    });
}

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
    if (reportModal) {
        reportModal.style.display = 'flex';
    }
    if (!mapInitialized) initMap();
}

function tryShowCurrentOnOpen() {
    if (!navigator.geolocation) return;
    if (marker) return;
    navigator.geolocation.getCurrentPosition(pos => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        if (mapInitialized) {
            placeMarker(latlng);
            map.setView(latlng, 16);
        }
    }, () => {});
}

function closeModalFn() {
    if (reportModal) {
        reportModal.style.display = 'none';
    }
}

// FIXED: Modified line 78 to open modal interface directly instead of navigating to map.html
if (reportBtn) {
    reportBtn.addEventListener('click', openModal);
}
if (closeModal) {
    closeModal.addEventListener('click', closeModalFn);
}
if (reportModal) {
    reportModal.addEventListener('click', (e) => { if (e.target === reportModal) closeModalFn(); });
}

reportTypeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedType = btn.getAttribute('data-type');
        if (selectedTypeElem) {
            selectedTypeElem.innerText = btn.innerText;
        }
    });
});

function initMap() {
    mapInitialized = true;
    // Default fallback coordinates centered broad view
    map = L.map('map').setView([-33.9249, 18.4241], 11);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.on('click', (e) => {
        placeMarker(e.latlng);
    });
    
    setTimeout(() => { 
        try { map.invalidateSize(); } catch(err){} 
    }, 250);
    
    tryShowCurrentOnOpen();
}

function placeMarker(latlng) {
    let ll = latlng;
    if (Array.isArray(latlng)) ll = L.latLng(latlng[0], latlng[1]);
    if (ll && ll.lat === undefined && ll.lat !== 0) return;
    
    if (marker) {
        marker.setLatLng(ll);
    } else {
        marker = L.marker(ll, {draggable: true}).addTo(map);
    }
    map.setView(ll, 16);
}

if (useCurrent) {
    useCurrent.addEventListener('click', () => {
        if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
        navigator.geolocation.getCurrentPosition(pos => {
            const latlng = [pos.coords.latitude, pos.coords.longitude];
            placeMarker(latlng);
        }, err => { alert('Unable to retrieve location'); });
    });
}

if (clearMarker) {
    clearMarker.addEventListener('click', () => { 
        if (marker) { 
            map.removeLayer(marker); 
            marker = null; 
        } 
    });
}

if (submitReport) {
    submitReport.addEventListener('click', () => {
        const titleElem = document.getElementById('title');
        const descElem = document.getElementById('desc');
        const reporterElem = document.getElementById('reporter'); // Safely handles lack of reporter input field
        
        const title = titleElem ? titleElem.value.trim() : "";
        const desc = descElem ? descElem.value.trim() : "";
        const reporter = reporterElem ? reporterElem.value.trim() : "Anonymous";
        
        if (!selectedType) { alert('Please choose a report type'); return; }
        if (!marker) { alert('Please select a location on the map or use current location'); return; }
        
        const latlng = marker.getLatLng();
        const reports = JSON.parse(localStorage.getItem('reports') || '[]');
        
        reports.push({ 
            type: selectedType, 
            title, 
            desc, 
            reporter, 
            lat: latlng.lat, 
            lng: latlng.lng, 
            ts: Date.now() 
        });
        
        localStorage.setItem('reports', JSON.stringify(reports));
        
        const msg = document.getElementById('submitMsg'); 
        if (msg) msg.style.display = 'block';
        
        setTimeout(() => { 
            if (msg) msg.style.display = 'none'; 
            closeModalFn(); 
        }, 1200);
    });
}

   
