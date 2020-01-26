console.log("connected app.js");

let ipAddress = "T";
let userName = "BILL";

// class Local {
//   constructor(ipAddress, userName) {
//     this.ipAddress = ipAddress;
//     this.userName = userName;
//     this.nameKey;
//     this.city;
//     this.country;
//     this.longitude;
//     this.latitude;
//     this.timezone;
//     this.tsUpdated;
//   }
// }

$("#myLogin").modal();

logActivity();

var email = "billstephan@yahoo.com";
var password = "MY!Password2";

firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
  console.log(error.code);
  console.log(error.message);
});