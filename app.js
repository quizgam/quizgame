let incidentCount = 0;
let backupCount = 0;

// Navigation
function showPage(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(page).classList.add("active");
}

// Ajout incident
function addIncident() {
  incidentCount++;
  const tbody = document.querySelector("#incidentTable tbody");
  const row = `<tr><td>${incidentCount}</td><td>Problème réseau</td><td>Ouvert</td></tr>`;
  tbody.insertAdjacentHTML("beforeend", row);
  updateCharts();
}

// Ajout sauvegarde
function addBackup() {
  backupCount++;
  const tbody = document.querySelector("#backupTable tbody");
  const date = new Date().toLocaleString();
  const row = `<tr><td>${backupCount}</td><td>Complète</td><td>${date}</td></tr>`;
  tbody.insertAdjacentHTML("beforeend", row);
  updateCharts();
}

// Export CSV
function exportCSV(type) {
  const rows = [...document.querySelectorAll(`#${type}Table tr`)];
  let csv = rows.map(r => [...r.children].map(c => `"${c.innerText}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${type}_report.csv`;
  link.click();
}

// Export PDF
function exportPDF(type) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(`Rapport ${type}`, 10, 10);
  let rows = [...document.querySelectorAll(`#${type}Table tr`)];
  let y = 20;
  rows.forEach(r => {
    let txt = [...r.children].map(c => c.innerText).join(" | ");
    doc.text(txt, 10, y);
    y += 8;
  });
  doc.save(`${type}_report.pdf`);
}

// Graphiques
const ctxIncidents = document.getElementById("chartIncidents");
const ctxBackups = document.getElementById("chartBackups");

const chartIncidents = new Chart(ctxIncidents, {
  type: "doughnut",
  data: {
    labels: ["Incidents"],
    datasets: [{ data: [0], backgroundColor: ["#ef4444"] }]
  }
});

const chartBackups = new Chart(ctxBackups, {
  type: "bar",
  data: {
    labels: ["Sauvegardes"],
    datasets: [{ label: "Nombre", data: [0], backgroundColor: "#22c55e" }]
  }
});

function updateCharts() {
  chartIncidents.data.datasets[0].data = [incidentCount];
  chartIncidents.update();

  chartBackups.data.datasets[0].data = [backupCount];
  chartBackups.update();
}
