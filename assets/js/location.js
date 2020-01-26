console.log("connected location.js");

let data = {};

$.getJSON('https://ssl.geoplugin.net/json.gp?k=207167b5568cc2a4', function (data) {
    // loading object for activity creation of Firebase activity document  
    ipAddress = data.geoplugin_request;
  })
  .then(function () {
    console.log(data);
  });


console.log(data);
console.log(ipAddress);