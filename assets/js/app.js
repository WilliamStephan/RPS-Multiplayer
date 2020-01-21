console.log("connected app.js");

var db = firebase.firestore();


logActivity();

function logActivity() {
  let ipAddress = "";
  let activityData = {};
  $.getJSON('http://www.geoplugin.net/json.gp?jsoncallback=?', function (data) {
      ipAddress = data.geoplugin_request;
      activityData = {
        city: data.geoplugin_city,
        region: data.geoplugin_region,
        regionCode: data.geoplugin_regionCode,
        country: data.geoplugin_countryName,
        countryCode: data.geoplugin_countryCode,
        continentCode: data.geoplugin_continentCode,
        dmaCode: data.geoplugin_dmaCode,
        longitude: data.geoplugin_longitude,
        latitude: data.geoplugin_latitude,
        timezone: data.geoplugin_timezone,
        currencyCode: data.geoplugin_currencyCode,
        currencySymbol: data.geoplugin_currencySymbol,
        appName: navigator.appCodeName + "-" + navigator.appName,
        usrAgent: navigator.userAgent,
        tsCreated: firebase.firestore.FieldValue.serverTimestamp(),
        tsUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        accessCount: 1
      }
    })
    .then(function () {
      const refActivityDoc = db.collection('activity').doc(ipAddress);
      refActivityDoc.get()
        .then(doc => {
          if (doc.exists) { // activity doc for IP address exists (update)
            refActivityDoc.update({
                tsUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                accessCount: firebase.firestore.FieldValue.increment(1)
              })
              .then(function () {
                console.log("Activity document updated with IP: " + ipAddress);
              })
              .catch(function (error) {
                console.error("Error updating activity document: ", error);
              });
          } else { // activity doc for IP address does NOT exists (create)
            refActivityDoc.set(activityData)
              .then(function () {
                console.log("Activity document written with IP: " + ipAddress);
              })
              .catch(function (error) {
                console.error("Error adding activity document: ", error);
              });
          }
        })
    });
}