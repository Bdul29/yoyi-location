<script>

let allData = [];
let filteredData = [];

// ==========================
// LOAD
// ==========================

window.onload = function () {

  loadData();

  document.getElementById("search").addEventListener("keyup", cari);

  document.getElementById("btnSearch").addEventListener("click", cari);

  document.getElementById("btnFilter").addEventListener("click", function () {

    document.getElementById("filterModal").style.display = "block";

  });

  document.getElementById("closeFilter").addEventListener("click", function () {

    document.getElementById("filterModal").style.display = "none";

  });

  document.getElementById("applyFilter").addEventListener("click", filterData);

  document.getElementById("resetFilter").addEventListener("click", resetFilter);

};

// ==========================
// AMBIL DATA
// ==========================

function loadData() {

  google.script.run
    .withSuccessHandler(function (data) {

      allData = data;
      filteredData = data;

      renderList(data);
      loadFilter();

    })
    .getLocations();

}

// ==========================
// FILTER
// ==========================

function loadFilter() {

  google.script.run
    .withSuccessHandler(function (data) {

      isiSelect("provinsi", data.provinsi);
      isiSelect("kota", data.kota);
      isiSelect("kecamatan", data.kecamatan);
      isiSelect("tipe", data.tipe);

    })
    .getFilter();

}

function isiSelect(id, arr) {

  const select = document.getElementById(id);

  arr.forEach(function (item) {

    let option = document.createElement("option");

    option.value = item;
    option.text = item;

    select.appendChild(option);

  });

}

// ==========================
// RENDER LIST
// ==========================

function renderList(data) {

  const list = document.getElementById("list");

  document.getElementById("loading").style.display = "none";

  document.getElementById("total").innerHTML = data.length;

  list.innerHTML = "";

  if (data.length == 0) {

    list.innerHTML = `
      <div style="text-align:center;padding:40px;color:#888;">
        Tidak ada lokasi ditemukan
      </div>
    `;

    return;

  }

  data.forEach(function (item) {

    list.innerHTML += `

<div class="list-card">

<div class="location-name">

📍 ${item.name}

</div>

<div class="location-address">

${item.kecamatan}<br>
${item.kota}<br>
${item.provinsi}

</div>

<div class="location-type">

${item.tipe}

</div>

<div class="location-footer">

<a href="${item.url}" target="_blank">

Lihat Lokasi

</a>

</div>

</div>

`;

  });

}

// ==========================
// SEARCH
// ==========================

function cari() {

  const keyword = document
    .getElementById("search")
    .value
    .toLowerCase();

  filteredData = allData.filter(function (item) {

    return (

      item.name.toLowerCase().includes(keyword) ||

      item.provinsi.toLowerCase().includes(keyword) ||

      item.kota.toLowerCase().includes(keyword) ||

      item.kecamatan.toLowerCase().includes(keyword) ||

      item.tipe.toLowerCase().includes(keyword)

    );

  });

  renderList(filteredData);

}

// ==========================
// APPLY FILTER
// ==========================

function filterData() {

  const provinsi = document.getElementById("provinsi").value;

  const kota = document.getElementById("kota").value;

  const kecamatan = document.getElementById("kecamatan").value;

  const tipe = document.getElementById("tipe").value;

  filteredData = allData.filter(function (item) {

    return (

      (provinsi == "" || item.provinsi == provinsi) &&

      (kota == "" || item.kota == kota) &&

      (kecamatan == "" || item.kecamatan == kecamatan) &&

      (tipe == "" || item.tipe == tipe)

    );

  });

  renderList(filteredData);

  document.getElementById("filterModal").style.display = "none";

}

// ==========================
// RESET
// ==========================

function resetFilter() {

  document.getElementById("provinsi").selectedIndex = 0;

  document.getElementById("kota").selectedIndex = 0;

  document.getElementById("kecamatan").selectedIndex = 0;

  document.getElementById("tipe").selectedIndex = 0;

  document.getElementById("search").value = "";

  filteredData = allData;

  renderList(allData);

}

</script>