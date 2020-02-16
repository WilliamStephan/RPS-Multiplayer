if (debug) {
  console.log("location.js linked");
}

function getLocation() {
  if (!locationLogged) { // grabs location data from geoplugin.net creates object for activity doc
    $.getJSON('https://ssl.geoplugin.net/json.gp?k=207167b5568cc2a4', function (data) {
      // loading object for activity creation of Firebase activity document  
      ipAddress = data.geoplugin_request;
      activityData.city = data.geoplugin_city;
      activityData.region = data.geoplugin_region;
      activityData.country = data.geoplugin_countryName;
      activityData.longitude = parseFloat(data.geoplugin_longitude);
      activityData.latitude = parseFloat(data.geoplugin_latitude);
      activityData.timezone = data.geoplugin_timezone;
      activityData.usrAgent = navigator.userAgent;
      activityData.accessCount = 0;
      locationLogged = true;
      colorChange("showHTML06", data.geoplugin_city + ", " + data.geoplugin_region, "BLUE", 0);
      colorChange("showHTML06", data.geoplugin_city + ", " + data.geoplugin_region, "BLACK", 1000);
      if (debug) {
        console.log("location init: " + data.geoplugin_delay, activityData.city);
      }
    })
  }
}