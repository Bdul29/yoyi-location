const SPREADSHEET_ID = "1AxSU0mkLd6sUVfPxYwVYlKyuN2Hc8d8q-k00D-UYrLQ";
const SHEET_NAME = "Sheet1";

function doGet(e) {

  const callback = e.parameter.callback;

  const data = getLocations();

  const json = JSON.stringify(data);

  if (callback) {

    return ContentService
      .createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}


/****************************************************
 * GET LOCATIONS
 ****************************************************/

function getLocations() {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName(SHEET_NAME);

  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    return [];
  }

  values.shift();

  const result = [];

  values.forEach(function(row) {

    const wkt = String(row[0] || "");
    const name = String(row[1] || "");

    if (!name) return;

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

      provinsi: String(row[2] || ""),

      kota: String(row[3] || ""),

      kecamatan: String(row[4] || ""),

      tipe: String(row[5] || ""),

      lat: lat,

      lng: lng,

      url:
        "https://www.google.com/maps?q=" +
        lat + "," + lng

    });

  });

  return result;
}
