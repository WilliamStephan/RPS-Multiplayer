console.log("connected app.js");

let ipAddress = "";
let userName = "BILL";

class Local {
  constructor(ipAddress, userName) {
    this.ipAddress = ipAddress;
    this.userName = userName;
    this.nameKey;
    this.city;
    this.country;
    this.longitude;
    this.latitude;
    this.timezone;
    this.tsUpdated;
  }
}



logActivity();