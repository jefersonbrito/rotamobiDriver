document.addEventListener("deviceready", function () {

    var onSuccess = function (position) {
        var lati = position.coords.latitude;
        var longi = position.coords.longitude;
        var s = document.getElementById("start");
        s.value = lati + ',' + longi;

        initMap(lati, longi);
//        alert('Latitude: ' + position.coords.latitude + '\n' +
//                'Longitude: ' + position.coords.longitude + '\n' +
//                'Altitude: ' + position.coords.altitude + '\n' +
//                'Accuracy: ' + position.coords.accuracy + '\n' +
//                'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
//                'Heading: ' + position.coords.heading + '\n' +
//                'Speed: ' + position.coords.speed + '\n' +
//                'Timestamp: ' + position.timestamp + '\n');

        var div = document.getElementById("map_canvas");

//        // Create a Google Maps native view under the map_canvas div.
//        var map = plugin.google.maps.Map.getMap(div);



        // Show the info window
//        marker.showInfoWindow();
    };

    // onError Callback receives a PositionError object
    function onError(error) {
        alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    function initMap(lat, lng) {

        const markerArray = [];
        const myLatLng = {lat: lat, lng: lng};

        // Instantiate a directions service.
        const directionsService = new google.maps.DirectionsService();

        // Create a map and center no seu local atual.
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 17,
            center: myLatLng
        });

        // Create a renderer for directions and bind it to the map.
        const directionsRenderer = new google.maps.DirectionsRenderer({map: map});

        const markerLocal = new google.maps.Marker({
            position: myLatLng,
            map,
            title: "Estou aqui"
        });

        markerLocal.setMap(map);
        getDrivers(map);

        // Instantiate an info window to hold step text.
        const stepDisplay = new google.maps.InfoWindow();

        // Listen to change events from the start and end lists.
        const onChangeHandler = function () {

            calculateAndDisplayRoute(
                    directionsRenderer,
                    directionsService,
                    markerArray,
                    stepDisplay,
                    map
                    );
        };

        document.getElementById("end").addEventListener("change", onChangeHandler);

        function calculateAndDisplayRoute(
                directionsRenderer,
                directionsService,
                markerArray,
                stepDisplay,
                map
                ) {

            // First, remove any existing markers from the map.
            for (let i = 0; i < markerArray.length; i++) {
                markerArray[i].setMap(null);
            }

            // Retrieve the start and end locations and create a DirectionsRequest using
            // WALKING directions.
            directionsService.route(
                    {
                        origin: document.getElementById("start").value,
                        destination: document.getElementById("end").value,
                        travelMode: google.maps.TravelMode.DRIVING
                    },
                    (result, status) => {
                // Route the directions and pass the response to a function to create
                // markers for each step.
                if (status === "OK" && result) {
                    document.getElementById("warnings-panel").innerHTML =
                            "<b>" + result.routes[0].warnings + "</b>";
                    directionsRenderer.setDirections(result);
//        showSteps(result, markerArray, stepDisplay, map);
                } else {
                    window.alert("Directions request failed due to " + status);
                }
            }
            );
        }

        function showSteps(directionResult, markerArray, stepDisplay, map) {
            // For each step, place a marker, and add the text to the marker's infowindow.
            // Also attach the marker to an array so we can keep track of it and remove it
            // when calculating new routes.
            const myRoute = directionResult.routes[0].legs[0];

            for (let i = 0; i < myRoute.steps.length; i++) {
                const marker = (markerArray[i] =
                        markerArray[i] || new google.maps.Marker());
                marker.setMap(map);
                marker.setPosition(myRoute.steps[i].start_location);
                attachInstructionText(
                        stepDisplay,
                        marker,
                        myRoute.steps[i].instructions,
                        map
                        );
            }
        }

        function attachInstructionText(stepDisplay, marker, text, map) {
            google.maps.event.addListener(marker, "click", () => {
                // Open an info window when the marker is clicked on, containing the text
                // of the step.
                stepDisplay.setContent(text);
                stepDisplay.open(map, marker);
            });
        }



    }


    initAutocomplete();
}, false);


// This sample uses the Places Autocomplete widget to:
// 1. Help the user select a place
// 2. Retrieve the address components associated with that place
// 3. Populate the form fields with those address components.
// This sample requires the Places library, Maps JavaScript API.
// Include the libraries=places parameter when you first load the API.
// For example: <script
// src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
let autocomplete;
let address1Field;

function initAutocomplete() {

    address1Field = document.querySelector("#end");

    // Create the autocomplete object, restricting the search predictions to
    // addresses in the US and Canada.
    autocomplete = new google.maps.places.Autocomplete(address1Field, {
        componentRestrictions: {country: ["br"]},
        fields: ["address_components", "geometry"],
        types: ["address"]
    });
    address1Field.focus();
    // When the user selects an address from the drop-down, populate the
    // address fields in the form.
    autocomplete.addListener("place_changed", fillInAddress);
}

function fillInAddress() {
    // Get the place details from the autocomplete object.
    const place = autocomplete.getPlace();
    let address1 = "";
    let postcode = "";

    // Get each component of the address from the place details,
    // and then fill-in the corresponding field on the form.
    // place.address_components are google.maps.GeocoderAddressComponent objects
    // which are documented at http://goo.gle/3l5i5Mr
    for (const component of place.address_components) {
        const componentType = component.types[0];
        switch (componentType) {
            case "street_number":
            {
                address1 = `${component.long_name} ${address1}`;
                alert(address1);
                break;
            }

            case "route":
            {
                address1 += component.short_name;
                break;
            }

            case "postal_code":
            {
                postcode = `${component.long_name}${postcode}`;
                break;
            }

            case "postal_code_suffix":
            {
                postcode = `${postcode}-${component.long_name}`;
                break;
            }
            case "locality":
                document.querySelector("#locality").value = component.long_name;
                break;

            case "administrative_area_level_1":
            {
                document.querySelector("#state").value = component.short_name;
                break;
            }
            case "country":
                document.querySelector("#country").value = component.long_name;
                break;
        }
    }
    address1Field.value = address1;
    postalField.value = postcode;
    // After filling the form with address components from the Autocomplete
    // prediction, set cursor focus on the second address line to encourage
    // entry of subpremise information such as apartment, unit, or floor number.
    address2Field.focus();
}

function getDrivers(map) {
    $.ajax({url: "http://devibe.com.br/getDrivers", success: function (result) {
            const imagem = "http://devibe.com.br/img/602136.png";
            for (var i = 0; i < result.length; i++) {
                var myLatLng = {lat: result[i].lat, lng: result[i].lng};
                $markerDriver = new google.maps.Marker({
                    'position': myLatLng,
                    map,
                    'title': result[i].name,
                    'label': result[i].name,
                    'icon': imagem
                });
                $markerDriver.setMap(map);
            }
        }});
}