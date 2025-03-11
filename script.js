// Initialize Charts
const phCtx = document.getElementById('phChart').getContext('2d');
const turbidityCtx = document.getElementById('turbidityChart').getContext('2d');
const tdsCtx = document.getElementById('tdsChart').getContext('2d');
const combinedCtx = document.getElementById('combinedChart').getContext('2d');

const phChart = new Chart(phCtx, {
  type: 'line',
  data: { labels: [], datasets: [{ label: 'pH', data: [], borderColor: '#00ff88', fill: false }] },
  options: { responsive: true, scales: { x: { title: { display: true, text: 'Time' } }, y: { title: { display: true, text: 'pH' } } } }
});

const turbidityChart = new Chart(turbidityCtx, {
  type: 'line',
  data: { labels: [], datasets: [{ label: 'Turbidity (NTU)', data: [], borderColor: '#ff5555', fill: false }] },
  options: { responsive: true, scales: { x: { title: { display: true, text: 'Time' } }, y: { title: { display: true, text: 'Turbidity' } } } }
});

const tdsChart = new Chart(tdsCtx, {
  type: 'line',
  data: { labels: [], datasets: [{ label: 'TDS (ppm)', data: [], borderColor: '#5555ff', fill: false }] },
  options: { responsive: true, scales: { x: { title: { display: true, text: 'Time' } }, y: { title: { display: true, text: 'TDS' } } } }
});

const combinedChart = new Chart(combinedCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      { label: 'pH', data: [], borderColor: '#00ff88', fill: false },
      { label: 'Turbidity (NTU)', data: [], borderColor: '#ff5555', fill: false },
      { label: 'TDS (ppm)', data: [], borderColor: '#5555ff', fill: false }
    ]
  },
  options: { responsive: true, scales: { x: { title: { display: true, text: 'Time' } }, y: { title: { display: true, text: 'Value' } } } }
});

// Initialize Map
const map = L.map('map').setView([20.5937, 78.9629], 5); // Center on India
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker;
map.on('click', (e) => {
  if (marker) marker.remove();
  marker = L.marker(e.latlng).addTo(map);
  document.getElementById('selectedLocation').textContent = `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`;
});

// Function to generate logical random sensor values
function getRandomValue(min, max, previousValue, fluctuation) {
  let newValue = previousValue + (Math.random() * fluctuation * 2 - fluctuation);
  newValue = Math.min(Math.max(newValue, min), max); // Ensure value stays within range
  return parseFloat(newValue.toFixed(2)); // Round to 2 decimal places
}

// Initialize previous values for realistic fluctuations
let previousPh = 7.0; // Neutral pH
let previousTurbidity = 0.5; // Clear water
let previousTds = 150; // Moderate TDS

// Function to simulate realistic sensor data
function simulateSensorData() {
  const ph = getRandomValue(6.0, 9.0, previousPh, 0.1); // pH fluctuates slightly
  const turbidity = getRandomValue(0, 5, previousTurbidity, 0.3); // Turbidity fluctuates moderately
  const tds = getRandomValue(50, 500, previousTds, 5); // TDS fluctuates more significantly

  // Update previous values
  previousPh = ph;
  previousTurbidity = turbidity;
  previousTds = tds;

  return { ph, turbidity, tds };
}

// Function to update status indicators
function updateStatus(elementId, value, min, max) {
  const statusElement = document.getElementById(elementId);
  const width = ((value - min) / (max - min)) * 100;
  statusElement.style.width = `${Math.min(width, 100)}%`; // Ensure width does not exceed 100%

  if (value < min || value > max) {
    statusElement.classList.add('danger');
  } else {
    statusElement.classList.remove('danger');
  }
}

// Function to update individual charts
function updateChart(chart, time, value) {
  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(value);
  if (chart.data.labels.length > 10) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update();
}

// Function to update combined chart
function updateCombinedChart(chart, time, ph, turbidity, tds) {
  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(ph);
  chart.data.datasets[1].data.push(turbidity);
  chart.data.datasets[2].data.push(tds);
  if (chart.data.labels.length > 10) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.shift();
    chart.data.datasets[2].data.shift();
  }
  chart.update();
}

// Function to update the table
function updateTable(time, ph, turbidity, tds) {
  const tableBody = document.getElementById('tableBody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${time}</td>
    <td>${ph}</td>
    <td>${turbidity}</td>
    <td>${tds}</td>
  `;
  tableBody.appendChild(row);

  // Limit the number of rows to 10
  if (tableBody.children.length > 10) {
    tableBody.removeChild(tableBody.firstChild);
  }
}

// Function to generate AI suggestions
function getSuggestion(type, value) {
  if (type === 'ph') {
    if (value < 6.5) return 'Water is acidic. Add alkaline substances like calcium carbonate or sodium bicarbonate to neutralize pH.';
    if (value > 8.5) return 'Water is alkaline. Add acidic substances like citric acid or vinegar to lower pH.';
    return 'pH is within the safe range (6.5–8.5). No action required.';
  }
  if (type === 'turbidity') {
    if (value > 1) return 'High turbidity detected. Use a multi-stage filtration system or sedimentation tank to remove suspended particles.';
    return 'Turbidity is within the safe range (<1 NTU). No action required.';
  }
  if (type === 'tds') {
    if (value > 300) return 'High TDS detected. Use reverse osmosis (RO) or distillation to reduce dissolved solids.';
    return 'TDS is within the safe range (<300 ppm). No action required.';
  }
}

// Modal functionality for "Learn More" buttons
const healthModal = document.getElementById('healthModal');
const healthModalTitle = document.getElementById('healthModalTitle');
const healthModalInfo = document.getElementById('healthModalInfo');
const closeBtns = document.querySelectorAll('.close');

// pH Learn More Button
document.getElementById('phButton').addEventListener('click', () => {
  healthModalTitle.textContent = 'pH: Health Effects & Treatment';
  healthModalInfo.innerHTML = `
    <strong>Harmful Effects:</strong>
    <ul>
      <li><strong>Low pH (Acidic Water):</strong> Can cause corrosion of pipes, leaching of metals (e.g., lead, copper), and gastrointestinal issues like nausea and vomiting.</li>
      <li><strong>High pH (Alkaline Water):</strong> Can cause skin irritation, reduce the effectiveness of disinfectants, and lead to scaling in pipes and appliances.</li>
    </ul>
    <strong>Treatment Plan:</strong>
    <ul>
      <li><strong>For Low pH:</strong> Add alkaline substances like calcium carbonate (limestone) or sodium bicarbonate (baking soda) to neutralize acidity.</li>
      <li><strong>For High pH:</strong> Add acidic substances like citric acid or vinegar to lower alkalinity. Use a pH adjustment system if necessary.</li>
    </ul>
  `;
  healthModal.style.display = 'flex';
});

// Turbidity Learn More Button
document.getElementById('turbidityButton').addEventListener('click', () => {
  healthModalTitle.textContent = 'Turbidity: Health Effects & Treatment';
  healthModalInfo.innerHTML = `
    <strong>Harmful Effects:</strong>
    <ul>
      <li><strong>High Turbidity:</strong> Can harbor harmful microorganisms like bacteria, viruses, and parasites, leading to waterborne diseases such as cholera and dysentery.</li>
      <li><strong>Reduced Water Clarity:</strong> Can interfere with disinfection processes, making water unsafe for consumption.</li>
    </ul>
    <strong>Treatment Plan:</strong>
    <ul>
      <li><strong>Filtration:</strong> Use a multi-stage filtration system with sediment filters to remove suspended particles.</li>
      <li><strong>Coagulation-Flocculation:</strong> Add coagulants like alum to clump particles together for easier removal.</li>
      <li><strong>Sedimentation:</strong> Allow water to sit in a tank so particles settle at the bottom.</li>
    </ul>
  `;
  healthModal.style.display = 'flex';
});

// TDS Learn More Button
document.getElementById('tdsButton').addEventListener('click', () => {
  healthModalTitle.textContent = 'TDS: Health Effects & Treatment';
  healthModalInfo.innerHTML = `
    <strong>Harmful Effects:</strong>
    <ul>
      <li><strong>High TDS:</strong> Can cause a salty or bitter taste, and may indicate the presence of harmful minerals like lead, arsenic, or fluoride.</li>
      <li><strong>Health Risks:</strong> Long-term consumption of high-TDS water can lead to kidney stones, cardiovascular issues, and gastrointestinal problems.</li>
    </ul>
    <strong>Treatment Plan:</strong>
    <ul>
      <li><strong>Reverse Osmosis (RO):</strong> Install an RO system to remove dissolved solids effectively.</li>
      <li><strong>Distillation:</strong> Use a distillation unit to evaporate and condense water, leaving impurities behind.</li>
      <li><strong>Water Softeners:</strong> Use ion-exchange resins to remove calcium and magnesium ions, which contribute to TDS.</li>
    </ul>
  `;
  healthModal.style.display = 'flex';
});

// Close Modals
closeBtns.forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    healthModal.style.display = 'none';
  });
});

window.addEventListener('click', (event) => {
  if (event.target === healthModal) {
    healthModal.style.display = 'none';
  }
});

// Function to update the dashboard
function updateDashboard() {
  const { ph, turbidity, tds } = simulateSensorData();
  const time = new Date().toLocaleTimeString();

  // Update displayed values
  document.getElementById('phValue').textContent = ph;
  document.getElementById('turbidityValue').textContent = turbidity;
  document.getElementById('tdsValue').textContent = tds;

  // Update status indicators
  updateStatus('phStatus', ph, 6.5, 8.5);
  updateStatus('turbidityStatus', turbidity, 0, 1);
  updateStatus('tdsStatus', tds, 50, 300);

  // Add AI suggestions
  document.getElementById('phSuggestion').textContent = getSuggestion('ph', ph);
  document.getElementById('turbiditySuggestion').textContent = getSuggestion('turbidity', turbidity);
  document.getElementById('tdsSuggestion').textContent = getSuggestion('tds', tds);

  // Add data to charts
  updateChart(phChart, time, ph);
  updateChart(turbidityChart, time, turbidity);
  updateChart(tdsChart, time, tds);
  updateCombinedChart(combinedChart, time, ph, turbidity, tds);

  // Add data to table
  updateTable(time, ph, turbidity, tds);
}

// Function to get state and authority number based on coordinates
function getStateAndAuthority(lat, lng) {
  // Example: Hardcoded data for demonstration
  const states = [
    { name: 'Maharashtra', authorityNumber: '1800-123-4567' },
    { name: 'Karnataka', authorityNumber: '1800-234-5678' },
    { name: 'Tamil Nadu', authorityNumber: '1800-345-6789' },
    { name: 'Uttar Pradesh', authorityNumber: '1800-456-7890' },
    { name: 'Delhi', authorityNumber: '1800-567-8901' },
    // Add more states and numbers as needed
  ];

  // Simulate state detection based on latitude and longitude
  if (lat > 18.5 && lat < 19.5 && lng > 72.8 && lng < 73.2) {
    return states[0]; // Maharashtra
  } else if (lat > 12.8 && lat < 13.2 && lng > 77.5 && lng < 77.7) {
    return states[1]; // Karnataka
  } else if (lat > 13.0 && lat < 13.2 && lng > 80.2 && lng < 80.3) {
    return states[2]; // Tamil Nadu
  } else if (lat > 26.8 && lat < 27.0 && lng > 80.9 && lng < 81.0) {
    return states[3]; // Uttar Pradesh
  } else if (lat > 28.6 && lat < 28.7 && lng > 77.1 && lng < 77.3) {
    return states[4]; // Delhi
  } else {
    return { name: 'Unknown', authorityNumber: 'Not Available' };
  }
}

// Update map click event to show place name, state, and authority number
map.on('click', (e) => {
  if (marker) marker.remove();
  marker = L.marker(e.latlng).addTo(map);

  // Get state and authority number
 // const { name: state, authorityNumber } = getStateAndAuthority(e.latlng.lat, e.latlng.lng);

  // Display location, state, and authority number
  document.getElementById('selectedLocation').innerHTML = `
    <strong>Selected Location:</strong> Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}<br>
    <strong>State:</strong> ${state}<br>
    <strong>Central Govt Water Quality Authority Number:</strong> ${4310-2030}
  `;
});



// Report Issues Form
document.getElementById('reportForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const issueDescription = document.getElementById('issueDescription').value;
  // Simulate sending the report (you can replace this with an API call)
  document.getElementById('reportStatus').textContent = 'Report submitted successfully!';
  document.getElementById('reportForm').reset();
});

// Update the dashboard every 2 seconds
setInterval(updateDashboard, 2000);

// Initialize the dashboard with the first data point
updateDashboard();