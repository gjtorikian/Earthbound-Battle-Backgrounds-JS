// give me some JSON based on the "?" params
function getJsonFromUrl() {
  var query = location.search.substr(1);
  if (query === "")
    return "";

  var data = query.split("&");
  var result = {};
  for(var i=0; i<data.length; i++) {
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
