console.log("connected firebase.js");







var db = firebase.firestore();





function logActivity() {

    let activityData = {};
    $.getJSON('http://www.geoplugin.net/json.gp?jsoncallback=?', function (data) {
            // loading object for activity creation of Firebase activity document  
            ipAddress = data.geoplugin_request;
            activityData = {
                city: data.geoplugin_city,
                region: data.geoplugin_region,
                regionCode: data.geoplugin_regionCode,
                country: data.geoplugin_countryName,
                countryCode: data.geoplugin_countryCode,
                continentCode: data.geoplugin_continentCode,
                dmaCode: parseInt(data.geoplugin_dmaCode),
                longitude: parseFloat(data.geoplugin_longitude),
                latitude: parseFloat(data.geoplugin_latitude),
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
                            .then(function () { // success logging
                                console.log("Activity document updated with IP: " + ipAddress);
                            })
                            .catch(function (error) { // error logging
                                console.error("Error updating activity document: ", error);
                            });
                    } else { // activity doc for IP address does NOT exists (create)
                        refActivityDoc.set(activityData) // creates activity document
                            .then(function () { // success logging
                                console.log("Activity document written with IP: " + ipAddress);
                            })
                            .catch(function (error) { // error logging
                                console.error("Error adding activity document: ", error);
                            });
                    }
                    if (doc.exists) {
                        console.log("YEP");
                    }
                })
        });
}

function getUser(userName, ipAddress) {
    const refUsrDoc = db.collection('user').doc(ipAddress + ":" + userName);
    refUsrDoc.get()
        .then(doc => {
            if (doc.exists) { // user doc for IP address exists (update)
                refUsrDoc.update({

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

                refUsrDoc.set(activityData)

                    .then(function () {
                        console.log("Activity document written with IP: " + ipAddress);
                    })
                    .catch(function (error) {
                        console.error("Error adding activity document: ", error);
                    });
            }
        })
}