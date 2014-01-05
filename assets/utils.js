// give me some JSON based on the "?" params
function getJsonFromUrl() {
  var query = location.search.substr(1);
  if (query === "")
    return "";

  var data = query.split("&");
  var result = {};
  for (var i=0; i<data.length; i++) {
    var item = data[i].split("=");
    result[item[0]] = item[1];
  }
  return result;
}

// append to the "?" params to construct a new URL
function setUrlFromString(value) {
  var currentUrlJson = getJsonFromUrl();
  if (currentUrlJson == "") {
    return "?" + value;
  }

  var data = value.split("=");
  var result = []
  currentUrlJson[data[0]] = data[1];

  for (var key in currentUrlJson) {
    if (currentUrlJson.hasOwnProperty(key)) {
      result.push(key + "=" + currentUrlJson[key]);
    }
  }

  return "?" + result.join("&");
}

function parseLayerParam(number) {
  var num = Number(number);
  if (num == NaN)
    return null;
  else if (num < 0 || num > 326)
    return null;
  else if (num == 0)
    return "0";

  return num;
}

function parseFrameskip(number) {
  var num = Number(number);
  if (num == NaN)
    return null;
  else if (num < 1 || num > 10)
    return null;

  return num;
}

function parseAspectRatioParam(number) {
  var num = Number(number);
  if (num == NaN)
    return null;
  else if (num != 0 && num != 16 && num != 48 && num != 64)
    return null;
  else if (num == 0)
    return "0";

  return num;
}

function isIOS() {
  return /(iPad|iPhone|iPod)/gi.test(navigator.userAgent);
}

function isSafari() {
  return /\(KHTML, like Gecko\)\s+Version\//gi.test(navigator.userAgent);
}
