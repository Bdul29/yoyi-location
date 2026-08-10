const API_URL =
    "https://script.google.com/macros/s/AKfycbztHwY74MZJijuK2hy55C2xMIDx9Ix7HSfg4mUyt7eYeM87QqYtm_xphhx6c3a6ub4/exec";


let allLocations = [];

let activeLocations = [];


/* ==============================
   START
============================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const btnFilter =
            document.getElementById("btnFilter");

        const closeFilter =
            document.getElementById("closeFilter");

        const applyFilter =
            document.getElementById("applyFilter");

        const resetFilter =
            document.getElementById("resetFilter");

        const search =
            document.getElementById("search");

        const clearSearch =
            document.getElementById("clearSearch");


        btnFilter.addEventListener(
            "click",
            openFilter
        );


        closeFilter.addEventListener(
            "click",
            closeFilterModal
        );


        applyFilter.addEventListener(
            "click",
            applyFilterData
        );


        resetFilter.addEventListener(
            "click",
            resetFilterData
        );


        search.addEventListener(
            "input",
            searchLocation
        );


        clearSearch.addEventListener(
            "click",
            clearSearchData
        );


        loadData();

    }
);


/* ==============================
   LOAD DATA
============================== */

function loadData() {

    fetch(API_URL)

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    "API tidak dapat diakses"
                );

            }

            return response.json();

        })


        .then(function(data) {

            console.log(
                "Data lokasi:",
                data
            );


            allLocations = data;

            activeLocations = data;


            buildFilters();


            renderList(
                activeLocations
            );


            document.getElementById(
                "loading"
            ).style.display = "none";


        })


        .catch(function(error) {

            console.error(
                "ERROR:",
                error
            );


            document.getElementById(
                "loading"
            ).innerHTML =
                "❌ Data lokasi tidak dapat dimuat.";

        });

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


    list.innerHTML = "";


    total.textContent =
        data.length;


    if (data.length === 0) {

        empty.hidden = false;

        return;

    }


    empty.hidden = true;


    data.forEach(function(item) {


        const card =
            document.createElement(
                "div"
            );


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
                    rel="noopener">

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
            .getElementById("search")
            .value
            .toLowerCase()
            .trim();


    const clearButton =
        document.getElementById(
            "clearSearch"
        );


    clearButton.style.display =
        keyword
        ? "block"
        : "none";


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

                .map(function(item) {

                    return item[key];

                })

                .filter(Boolean)

        )

    ].sort();

}


function fillSelect(
    id,
    values
) {

    const select =
        document.getElementById(id);


    values.forEach(
        function(value) {

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

        }
    );

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
        allLocations;


    renderList(
        activeLocations
    );

}


/* ==============================
   FILTER MODAL
============================== */

function openFilter() {

    document.getElementById(
        "filterModal"
    ).hidden = false;

}


function closeFilterModal() {

    document.getElementById(
        "filterModal"
    ).hidden = true;

}


/* ==============================
   CLEAR SEARCH
============================== */

function clearSearchData() {

    document.getElementById(
        "search"
    ).value = "";


    document.getElementById(
        "clearSearch"
    ).style.display = "none";


    activeLocations =
        allLocations;


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
