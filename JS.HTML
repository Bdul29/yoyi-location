/*
  YOYI! LOCATION - GitHub Pages
  Data source: Google Sheets (GViz JSON)
*/

const SHEET_ID = "1AxSU0mkLd6sUVfPxYwVYlKyuN2Hc8d8q-k00D-UYrLQ";
const GID = "0";

let allLocations = [];
let activeLocations = [];
let filters = {
  provinsi: "",
  kota: "",
  kecamatan: "",
  tipe: ""
};

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  $("filterBtn").addEventListener("click", openFilter);
  $("closeFilter").addEventListener("click", closeFilter);
  $("modalBackdrop").addEventListener("click", closeFilter);
  $("applyFilter").addEventListener("click", applyFilter);
  $("resetFilter").addEventListener("click", resetFilter);
  $("searchInput").addEventListener("input", runSearch);
  $("clearSearch").addEventListener("click", clearSearch);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeFilter();
  });

  loadLocations();
});

async function loadLocations() {
  showLoading(true);
  showError("");

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
    `?tqx=out:json&gid=${encodeURIComponent(GID)}`;

  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Google Sheets HTTP ${response.status}`);
    }

    const text = await response.text();
    const jsonText = text
      .replace(/^[\s\S]*?google\.visualization\.Query\.setResponse\(/, "")
      .replace(/\);\s*$/, "");

    const json = JSON.parse(jsonText);

    const rows = json.table?.rows || [];
    allLocations = rows.map(parseRow).filter(Boolean);

    activeLocations = [...allLocations];

    buildFilterOptions();
    renderLocations(activeLocations);
    showLoading(false);

  } catch (error) {
    console.error(error);
    showLoading(false);
    showError(
      "Data lokasi belum dapat dimuat. Pastikan Google Sheet dapat diakses publik " +
      "dan kolom datanya sesuai."
    );
    $("resultInfo").textContent = "Gagal mengambil data.";
  }
}

function parseRow(row) {
  const c = row.c || [];

  const wkt = cell(c[0]);
  const name = cell(c[1]);
  const provinsi = cell(c[2]);
  const kota = cell(c[3]);
  const kecamatan = cell(c[4]);
  const tipe = cell(c[5]);

  if (!wkt || !name) return null;

  const match = String(wkt).match(
    /POINT\s*\(\s*([-+]?\d+(?:\.\d+)?)\s+([-+]?\d+(?:\.\d+)?)\s*\)/i
  );

  let lat = "";
  let lng = "";

  if (match) {
    lng = parseFloat(match[1]);
    lat = parseFloat(match[2]);
  }

  const mapUrl = lat !== "" && lng !== ""
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : "#";

  return {
    name,
    provinsi,
    kota,
    kecamatan,
    tipe,
    lat,
    lng,
    mapUrl
  };
}

function cell(item) {
  if (!item) return "";
  if (item.v !== undefined && item.v !== null) return String(item.v).trim();
  if (item.f !== undefined && item.f !== null) return String(item.f).trim();
  return "";
}

function buildFilterOptions() {
  fillSelect("provinsi", uniqueValues("provinsi"));
  fillSelect("kota", uniqueValues("kota"));
  fillSelect("kecamatan", uniqueValues("kecamatan"));
  fillSelect("tipe", uniqueValues("tipe"));
}

function uniqueValues(key) {
  return [...new Set(
    allLocations
      .map(item => item[key])
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "id"));
}

function fillSelect(id, values) {
  const select = $(id);
  select.innerHTML = "";

  const defaultText = {
    provinsi: "Semua Provinsi",
    kota: "Semua Kota",
    kecamatan: "Semua Kecamatan",
    tipe: "Semua Tipe"
  }[id];

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = defaultText;
  select.appendChild(defaultOption);

  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function renderLocations(data) {
  const list = $("locationList");
  list.innerHTML = "";

  $("totalCount").textContent = data.length.toLocaleString("id-ID");
  $("resultInfo").textContent =
    data.length === allLocations.length
      ? `${allLocations.length.toLocaleString("id-ID")} lokasi tersedia`
      : `${data.length.toLocaleString("id-ID")} lokasi sesuai pencarian`;

  $("empty").hidden = data.length !== 0;

  const fragment = document.createDocumentFragment();

  data.forEach(item => {
    const card = document.createElement("article");
    card.className = "location-card";

    const addressParts = [
      item.kecamatan,
      item.kota,
      item.provinsi
    ].filter(Boolean);

    card.innerHTML = `
      <div class="location-name">
        <span class="pin">📍</span>
        <span>${escapeHtml(item.name)}</span>
      </div>

      <div class="location-address">
        ${addressParts.map(escapeHtml).join("<br>")}
      </div>

      ${
        item.tipe
          ? `<div class="location-type">${escapeHtml(item.tipe)}</div>`
          : ""
      }

      <div class="location-footer">
        <a href="${escapeAttribute(item.mapUrl)}" target="_blank" rel="noopener noreferrer">
          Lihat Lokasi →
        </a>
      </div>
    `;

    fragment.appendChild(card);
  });

  list.appendChild(fragment);
}

function runSearch() {
  const keyword = $("searchInput").value.trim().toLowerCase();
  $("clearSearch").style.display = keyword ? "block" : "none";
  refreshResults(keyword);
}

function refreshResults(keyword = $("searchInput").value.trim().toLowerCase()) {
  activeLocations = allLocations.filter(item => {
    const matchesSearch =
      !keyword ||
      [
        item.name,
        item.provinsi,
        item.kota,
        item.kecamatan,
        item.tipe
      ].some(value =>
        String(value || "").toLowerCase().includes(keyword)
      );

    const matchesProvinsi =
      !filters.provinsi || item.provinsi === filters.provinsi;

    const matchesKota =
      !filters.kota || item.kota === filters.kota;

    const matchesKecamatan =
      !filters.kecamatan || item.kecamatan === filters.kecamatan;

    const matchesTipe =
      !filters.tipe || item.tipe === filters.tipe;

    return (
      matchesSearch &&
      matchesProvinsi &&
      matchesKota &&
      matchesKecamatan &&
      matchesTipe
    );
  });

  renderLocations(activeLocations);
}

function openFilter() {
  $("filterModal").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeFilter() {
  $("filterModal").hidden = true;
  document.body.style.overflow = "";
}

function applyFilter() {
  filters.provinsi = $("provinsi").value;
  filters.kota = $("kota").value;
  filters.kecamatan = $("kecamatan").value;
  filters.tipe = $("tipe").value;

  refreshResults();
  closeFilter();
}

function resetFilter() {
  $("provinsi").value = "";
  $("kota").value = "";
  $("kecamatan").value = "";
  $("tipe").value = "";

  filters = {
    provinsi: "",
    kota: "",
    kecamatan: "",
    tipe: ""
  };

  refreshResults();
}

function clearSearch() {
  $("searchInput").value = "";
  $("clearSearch").style.display = "none";
  refreshResults("");
  $("searchInput").focus();
}

function showLoading(show) {
  $("loading").hidden = !show;
}

function showError(message) {
  $("error").textContent = message;
  $("error").hidden = !message;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
