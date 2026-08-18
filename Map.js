
// Map page script: initializes map, draggable colored pin, and sidebar interactions
const types = [
    {button id: 'pothole', label: 'Pothole', color: '#d9534f' },
    {button id: 'streetlight', label: 'Streetlight', color: '#f0ad4e' },
    {button id: 'garbage', label: 'Garbage', color: '#5cb85c' },
    {button id: 'sign', label: 'Sign', color: '#5bc0de' },
    {button id: 'other', label: 'Other', color: '#6c757d' }
];

let map = null;
let marker = null;
let selectedType = null;
let dragEnabled = true;

function createPinDataUrl(color) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='48' viewBox='0 0 36 48'>
        <path d='M18 0C8 0 0 8 0 18c0 12 18 30 18 30s18-18 18-30C36 8 28 0 18 0z' fill='${color}' stroke='#ffffff' stroke-width='2'/>
        <circle cx='18' cy='18' r='7' fill='white' />
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function createIcon(color) {
    return L.icon({
        iconUrl: createPinDataUrl(color),
        iconSize: [36,48],
        iconAnchor: [18,48]
    });
}

function init() {
    const mapEl = document.getElementById('map');
    map = L.map(mapEl).setView([-33.931000, 18.859000], 13);

    L.tileLayer(
       'https://{s}.tile.openstreermap.org/{z}/{x}/{y}.png',attribution:@OpenStreetMapcontributors'
}).addTo(map);

    // create a default marker at center (hidden until set)
    marker = L.marker([0,0], { draggable: true, opacity: 0 }).addTo(map);
    marker.on('dragend', updateLatLngDisplay);

    map.on('click', (e) => {
        if (!dragEnabled) return;
        setMarker(e.latlng.lat, e.latlng.lng);
    });

    // populate types
    const typeGrid = document.getElementById('typeGrid');
    types.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'type-btn';
        btn.style.background =t.color;
        btn.innerText =t.label[0];
        btn.title =t.label;
        btn.dataset.type =t.id;
        btn.dataset.color =t.color;
        btn.addEventListener('click', () => { selectType(t.id); });
        typeGrid.appendChild(btn);
    });

    document.getElementById('useCurrentBtn').addEventListener('click', useCurrentLocation);
    document.getElementById('enableDragBtn').addEventListener('click', () => {
        dragEnabled = true;
        document.getElementById('enableDragBtn').innerText = 'Select location (drag pin)';
    });
    document.getElementById('submitBtn').addEventListener('click', submitReport);

    // try to set current location
    useCurrentLocation();
}

function selectType(typeId) {
    selectedType = types.find(t => t.id === typeId);
    // highlight selected
    document.querySelectorAll('.type-btn').forEach(b => b.classList.toggle('selected', b.dataset.type === typeId));
    // update preview color
    const preview = document.getElementById('colorPreview');
    preview.style.background = selectedType.color;
    // update marker icon color if marker exists
    if (marker) {
        marker.setIcon(createIcon(selectedType.color));
        marker.setOpacity(1);
    }
}

function setMarker(lat, lng) {
    marker.setLatLng([lat, lng]);
    marker.setOpacity(1);
    map.setView([lat, lng], 16);
    updateLatLngDisplay();
    if (selectedType) marker.setIcon(createIcon(selectedType.color));
}

function updateLatLngDisplay() {
    const latlng = marker.getLatLng();
    if (!latlng) { document.getElementById('latlngDisplay').innerText = 'No location selected'; return; }
    document.getElementById('latlngDisplay').innerText = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
}

function useCurrentLocation() {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(pos => {
        setMarker(pos.coords.latitude, pos.coords.longitude);
    }, err => { alert('Unable to retrieve location'); });
}

function submitReport() {
    const title = document.getElementById('title').value.trim();
    const desc = document.getElementById('desc').value.trim();
    const reporter = document.getElementById('reporter').value.trim();
    if (!selectedType) { alert('Please choose a report type'); return; }
    const latlng = marker.getLatLng();
    if (!latlng || marker.options.opacity === 0) { alert('Please select a location on the map or use current location'); return; }
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    reports.push({ type: selectedType.id, title, desc, reporter, lat: latlng.lat, lng: latlng.lng, ts: Date.now() });
    localStorage.setItem('reports', JSON.stringify(reports));
    const msg = document.getElementById('submitMsg'); msg.style.display='block';
    setTimeout(() => { msg.style.display='none'; }, 1400);
}<h3>Drop a pin for the issue location</h3>
<div id="map" style="height: 400px; width: 100%; border-radius: 8px; margin: 12px 0;"></div>
<button type="button" id="useGPS">📍 Use My Current Location</button>
<p>Selected: <span id="coords">Click on map</span></p>

<!-- Hidden inputs for your form -->
<input type="hidden" id="latitude" name="latitude">
<input type="hidden" id="longitude" name="longitude">

<script>
let map;
let marker;

function initMap() {
  // Start at Cape Town
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -33.9249, lng: 18.4241 }, 
    zoom: 12,
  });

  map.addListener("click", (e) => {
    placeMarker(e.latLng);
  });

  document.getElementById("useGPS").onclick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        map.setCenter(pos);
        map.setZoom(16);
        placeMarker(pos);
      });
    } else {
      alert("GPS not supported");
    }
  }
}

function placeMarker(location) {
  if (marker) marker.setMap(null);
  marker = new google.maps.Marker({ position: location, map: map });
  document.getElementById('coords').innerText = location.lat().toFixed(5) + ', ' + location.lng().toFixed(5);
  document.getElementById('latitude').value = location.lat();
  document.getElementById('longitude').value = location.lng();
}
</body>
</html>
