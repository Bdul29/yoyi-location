const SHEET_ID = "1AxSU0mkLd6sUVfPxYwVYlKyuN2Hc8d8q-k00D-UYrLQ";
const GID = "0";

let allLocations = [];
let activeLocations = [];


/* ==============================
   START
============================== */

document.addEventListener("DOMContentLoaded", function () {

    const btnFilter = document.getElementById("btnFilter");
    const closeFilter = document.getElementById("closeFilter");
    const applyFilter = document.getElementById("applyFilter");
    const resetFilter = document.getElementById("resetFilter");

    const search = document.getElementById("search");
    const clearSearch = document.getElementById("clearSearch");

    if (btnFilter) {
        btnFilter.addEventListener("click", openFilter);
    }

    if (closeFilter) {
        closeFilter.addEventListener("click", closeFilterModal);
    }

    if (applyFilter) {
        applyFilter.addEventListener("click", applyFilterData);
    }

    if (resetFilter) {
        resetFilter.addEventListener("click", resetFilterData);
    }

    if (search) {
        search.addEventListener("input", searchLocation);
    }

    if (clearSearch) {
        clearSearch.addEventListener("click", clearSearchData);
    }

    loadData();

});


/* ==============================
   LOAD GOOGLE SHEET
============================== */

function loadData() {

    const url = "./locations.csv";

    fetch(url)
        .then(function(response) {

            if (!response.ok) {
                throw new Error(
                    "File locations.csv tidak ditemukan"
                );
            }

            return response.text();

        })

        .then(function(csv) {

            console.log("CSV berhasil dibaca");

            allLocations = parseCSV(csv);

            activeLocations = allLocations;

            buildFilters();

            renderList(activeLocations);

            document.getElementById("loading")
                .style.display = "none";

        })

        .catch(function(error) {

            console.error(
                "ERROR LOAD DATA:",
                error
            );

            document.getElementById("loading")
                .innerHTML =
                "❌ Data lokasi tidak dapat dimuat.<br>" +
                "<small>" +
                error.message +
                "</small>";

        });

}


/* ==============================
   CSV PARSER
============================== */

function parseCSV(csv) {

    const rows = [];

    let row = [];
    let value = "";

    let insideQuotes = false;


    for (let i = 0; i < csv.length; i++) {

        const char = csv[i];
        const nextChar = csv[i + 1];


        /* QUOTE */

        if (char === '"') {

            if (insideQuotes && nextChar === '"') {

                value += '"';

                i++;

            } else {

                insideQuotes = !insideQuotes;

            }

            continue;

        }


        /* COMMA */

        if (char === "," && !insideQuotes) {

            row.push(value);

            value = "";

            continue;

        }


        /* NEW LINE */

        if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (char === "\r" && nextChar === "\n") {
                i++;
            }

            row.push(value);

            value = "";

            if (row.length > 0) {
                rows.push(row);
            }

            row = [];

            continue;

        }


        value += char;

    }


    /* LAST ROW */

    if (value !== "" || row.length > 0) {

        row.push(value);

        rows.push(row);

    }


    if (rows.length <= 1) {

        return [];

    }


    const result = [];


    /* SKIP HEADER */

    for (let i = 1; i < rows.length; i++) {

        const row = rows[i];


        const wkt =
            String(row[0] || "").trim();

        const name =
            String(row[1] || "").trim();

        const provinsi =
            String(row[2] || "").trim();

        const kota =
            String(row[3] || "").trim();

        const kecamatan =
            String(row[4] || "").trim();

        const tipe =
            String(row[5] || "").trim();


        if (!name) {

            continue;

        }


        let lat = "";
        let lng = "";


        /*

           FORMAT:

           POINT (97.96694860 2.391343370)

           lng = 97.96694860
           lat = 2.391343370

        */

        const match =
            wkt.match(
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
   RENDER LIST
============================== */

function renderList(data) {

    const list =
        document.getElementById("list");

    const total =
        document.getElementById("total");

    const empty =
        document.getElementById("empty");


    if (!list) {

        console.error(
            "Element #list tidak ditemukan"
        );

        return;

    }


    list.innerHTML = "";


    if (total) {

        total.textContent =
            data.length;

    }


    if (data.length === 0) {

        if (empty) {
            empty.hidden = false;
        }

        return;

    }


    if (empty) {
        empty.hidden = true;
    }


    data.forEach(function(item) {

        const card =
            document.createElement("div");


        card.className =
            "location-card";


        card.innerHTML = `

            <div class="location-name">

                <span class="pin">
                    📍
                </span>

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
                    target="_blank"
                    rel="noopener noreferrer">

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

    const searchElement =
        document.getElementById("search");

    if (!searchElement) {
        return;
    }


    const keyword =
        searchElement.value
            .toLowerCase()
            .trim();


    const clearButton =
        document.getElementById(
            "clearSearch"
        );


    if (clearButton) {

        clearButton.style.display =
            keyword
            ? "block"
            : "none";

    }


    activeLocations =
        allLocations.filter(
            function(item) {

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

            }
        );


    renderList(
        activeLocations
    );

}


/* ==============================
   BUILD FILTER
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


/* ==============================
   UNIQUE
============================== */

function unique(key) {

    return [

        ...new Set(

            allLocations

                .map(function(item) {

                    return item[key];

                })

                .filter(Boolean)

        )

    ].sort();

}


/* ==============================
   FILL SELECT
============================== */

function fillSelect(id, values) {

    const select =
        document.getElementById(id);


    if (!select) {

        console.error(
            "Select #" + id +
            " tidak ditemukan"
        );

        return;

    }


    values.forEach(function(value) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            value;


        option.textContent =
            value;


        select.appendChild(
            option
        );

    });

}


/* ==============================
   APPLY FILTER
============================== */

function applyFilterData() {

    const provinsi =
        document.getElementById(
            "provinsi"
        ).value;


    const kota =
        document.getElementById(
            "kota"
        ).value;


    const kecamatan =
        document.getElementById(
            "kecamatan"
        ).value;


    const tipe =
        document.getElementById(
            "tipe"
        ).value;


    activeLocations =
        allLocations.filter(
            function(item) {

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

            }
        );


    renderList(
        activeLocations
    );


    closeFilterModal();

}


/* ==============================
   RESET FILTER
============================== */

function resetFilterData() {

    document.getElementById(
        "provinsi"
    ).value = "";


    document.getElementById(
        "kota"
    ).value = "";


    document.getElementById(
        "kecamatan"
    ).value = "";


    document.getElementById(
        "tipe"
    ).value = "";


    activeLocations =
        [...allLocations];


    renderList(
        activeLocations
    );

}


/* ==============================
   FILTER MODAL
============================== */

function openFilter() {

    const modal =
        document.getElementById(
            "filterModal"
        );


    if (modal) {

        modal.hidden = false;

    }

}


function closeFilterModal() {

    const modal =
        document.getElementById(
            "filterModal"
        );


    if (modal) {

        modal.hidden = true;

    }

}


/* ==============================
   CLEAR SEARCH
============================== */

function clearSearchData() {

    const search =
        document.getElementById(
            "search"
        );


    if (search) {

        search.value = "";

    }


    const clearButton =
        document.getElementById(
            "clearSearch"
        );


    if (clearButton) {

        clearButton.style.display =
            "none";

    }


    activeLocations =
        [...allLocations];


    renderList(
        activeLocations
    );

}


/* ==============================
   ESCAPE HTML
============================== */

function escapeHTML(text) {

    return String(text || "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
