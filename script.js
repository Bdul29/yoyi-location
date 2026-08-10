const SHEET_ID = "1AxSU0mkLd6sUVfPxYwVYlKyuN2Hc8d8q-k00D-UYrLQ";
const GID = "0";

let allLocations = [];
let activeLocations = [];

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("filterBtn")
        .addEventListener("click", openFilter);

    document.getElementById("closeFilter")
        .addEventListener("click", closeFilter);

    document.getElementById("modalBackdrop")
        .addEventListener("click", closeFilter);

    document.getElementById("applyFilter")
        .addEventListener("click", applyFilter);

    document.getElementById("resetFilter")
        .addEventListener("click", resetFilter);

    document.getElementById("searchInput")
        .addEventListener("input", searchLocation);

    document.getElementById("clearSearch")
        .addEventListener("click", clearSearch);

    loadData();

});


/* ==============================
   LOAD GOOGLE SHEET
============================== */

function loadData() {

    const url =
        "https://docs.google.com/spreadsheets/d/" +
        SHEET_ID +
        "/export?format=csv&gid=" +
        GID;

    fetch(url)
        .then(function(response) {

            if (!response.ok) {
                throw new Error(
                    "Google Sheet tidak dapat diakses"
                );
            }

            return response.text();

        })

        .then(function(csv) {

            console.log("Google Sheet berhasil dibaca");

            allLocations = parseCSV(csv);

            activeLocations = allLocations;

            buildFilters();

            renderList(activeLocations);

            document.getElementById("loading").style.display = "none";

        })

        .catch(function(error) {

            console.error(error);

            document.getElementById("loading").innerHTML =
                "❌ Data lokasi tidak dapat dimuat.<br>" +
                "Pastikan Google Sheet sudah diset <b>Anyone with the link → Viewer</b>.";

        });

}


/* ==============================
   CSV PARSER
============================== */

function parseCSV(csv) {

    const rows = csv
        .trim()
        .split(/\r?\n/);

    const result = [];

    // mulai dari baris kedua karena baris pertama header
    for (let i = 1; i < rows.length; i++) {

        const row = parseCSVLine(rows[i]);

        if (!row.length) continue;

        const wkt = row[0] || "";
        const name = row[1] || "";
        const provinsi = row[2] || "";
        const kota = row[3] || "";
        const kecamatan = row[4] || "";
        const tipe = row[5] || "";

        if (!name) continue;

        let lat = "";
        let lng = "";

        const match = wkt.match(
            /POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i
        );

        if (match) {

            lng = parseFloat(match[1]);
            lat = parseFloat(match[2]);

        }

        result.push({

            name: name,

            provinsi: provinsi,

            kota: kota,

            kecamatan: kecamatan,

            tipe: tipe,

            lat: lat,

            lng: lng,

            url:
                "https://www.google.com/maps?q=" +
                lat +
                "," +
                lng

        });

    }

    return result;

}


/* ==============================
   CSV LINE PARSER
============================== */

function parseCSVLine(line) {

    const result = [];

    let current = "";

    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {

        const char = line[i];

        if (char === '"') {

            insideQuotes = !insideQuotes;

        }

        else if (char === "," && !insideQuotes) {

            result.push(current.trim());

            current = "";

        }

        else {

            current += char;

        }

    }

    result.push(current.trim());

    return result.map(function(value) {

        return value
            .replace(/^"|"$/g, "")
            .replace(/""/g, '"');

    });

}


/* ==============================
   RENDER LIST
============================== */

function renderList(data) {

    const list =
        document.getElementById("locationList");

    list.innerHTML = "";

    document.getElementById("totalCount")
        .textContent = data.length;

    document.getElementById("resultInfo")
        .textContent =
        data.length +
        " lokasi tersedia";


    if (data.length === 0) {

        document.getElementById("empty").hidden = false;

        return;

    }

    document.getElementById("empty").hidden = true;


    data.forEach(function(item) {

        const card =
            document.createElement("div");

        card.className =
            "location-card";


        card.innerHTML = `

            <div class="location-name">

                <span class="pin">📍</span>

                <span>
                    ${escapeHTML(item.name)}
                </span>

            </div>


            <div class="location-address">

                ${escapeHTML(item.kecamatan)}
                <br>

                ${escapeHTML(item.kota)}
                <br>

                ${escapeHTML(item.provinsi)}

            </div>


            ${
                item.tipe
                ?
                `
                <div class="location-type">
                    ${escapeHTML(item.tipe)}
                </div>
                `
                :
                ""
            }


            <div class="location-footer">

                <a
                    href="${item.url}"
                    target="_blank">

                    Lihat Lokasi →

                </a>

            </div>

        `;


        list.appendChild(card);

    });

}


/* ==============================
   SEARCH
============================== */

function searchLocation() {

    const keyword =
        document
        .getElementById("searchInput")
        .value
        .toLowerCase();


    document.getElementById("clearSearch")
        .style.display =
        keyword ? "block" : "none";


    activeLocations =
        allLocations.filter(function(item) {

            return (

                item.name
                    .toLowerCase()
                    .includes(keyword)

                ||

                item.provinsi
                    .toLowerCase()
                    .includes(keyword)

                ||

                item.kota
                    .toLowerCase()
                    .includes(keyword)

                ||

                item.kecamatan
                    .toLowerCase()
                    .includes(keyword)

                ||

                item.tipe
                    .toLowerCase()
                    .includes(keyword)

            );

        });


    renderList(activeLocations);

}


/* ==============================
   FILTER
============================== */

function buildFilters() {

    fillSelect(
        "provinsi",
        unique("provinsi")
    );

    fillSelect(
        "kota",
        unique("kota")
    );

    fillSelect(
        "kecamatan",
        unique("kecamatan")
    );

    fillSelect(
        "tipe",
        unique("tipe")
    );

}


function unique(key) {

    return [
        ...new Set(
            allLocations
                .map(item => item[key])
                .filter(Boolean)
        )
    ].sort();

}


function fillSelect(id, values) {

    const select =
        document.getElementById(id);

    values.forEach(function(value) {

        const option =
            document.createElement("option");

        option.value = value;

        option.textContent = value;

        select.appendChild(option);

    });

}


function applyFilter() {

    const provinsi =
        document.getElementById("provinsi").value;

    const kota =
        document.getElementById("kota").value;

    const kecamatan =
        document.getElementById("kecamatan").value;

    const tipe =
        document.getElementById("tipe").value;


    activeLocations =
        allLocations.filter(function(item) {

            return (

                (!provinsi ||
                 item.provinsi === provinsi)

                &&

                (!kota ||
                 item.kota === kota)

                &&

                (!kecamatan ||
                 item.kecamatan === kecamatan)

                &&

                (!tipe ||
                 item.tipe === tipe)

            );

        });


    renderList(activeLocations);

    closeFilter();

}


function resetFilter() {

    document.getElementById("provinsi").value = "";

    document.getElementById("kota").value = "";

    document.getElementById("kecamatan").value = "";

    document.getElementById("tipe").value = "";


    activeLocations = allLocations;

    renderList(activeLocations);

}


/* ==============================
   MODAL
============================== */

function openFilter() {

    document.getElementById("filterModal")
        .hidden = false;

}


function closeFilter() {

    document.getElementById("filterModal")
        .hidden = true;

}


/* ==============================
   CLEAR SEARCH
============================== */

function clearSearch() {

    document.getElementById("searchInput")
        .value = "";

    document.getElementById("clearSearch")
        .style.display = "none";

    activeLocations = allLocations;

    renderList(activeLocations);

}


/* ==============================
   ESCAPE HTML
============================== */

function escapeHTML(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
