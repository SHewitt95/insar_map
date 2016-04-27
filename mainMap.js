// how to do it with leaflet
/*var map = L.map("map-container").setView([51.505, -0.09], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'kjjj11223344.p8g6k9ha',
    accessToken: "pk.eyJ1Ijoia2pqajExMjIzMzQ0IiwiYSI6ImNpbDJqYXZ6czNjdWd2eW0zMTA2aW1tNXUifQ.cPofQqq5jqm6l4zix7k6vw"
}).addTo(map);*/

var currentPoint = 1;
var filename = "/data/test_chunk_";

function Map(loadJSONFunc) {
    // my mapbox api key
    mapboxgl.accessToken = "pk.eyJ1Ijoia2pqajExMjIzMzQ0IiwiYSI6ImNpbDJqYXZ6czNjdWd2eW0zMTA2aW1tNXUifQ.cPofQqq5jqm6l4zix7k6vw";
    // the map
    this.map = null;
    this.geoJSONSource = null;
    this.geodata = null;
    this.drawer = null;
    this.geoDataMap = {};
    this.layers = [];
    this.JSONCallback = function(response) {
        // that function is called once the AJAX loads the geojson

        geodata = JSON.parse(response); // put response geojson string into a js object
        //tileIndex = geojsonvt(data);
        //console.log(geodata.features);

        // example loop to show how we can change the geodata JSON object at runtime with code
        for (var i = 0, len = geodata.features.length; i < len; i++) {
            // set title
            geodata.features[i].properties.title = "\"" + i + "\"";
            // set colors
            geodata.features[i].properties.myData = randomArray();
            if (i < -0.15682001908620198) {
                geodata.features[i].properties["marker-symbol"] = "greenMarker";
            } else if (i < 0.05441098411877951) {
                geodata.features[i].properties["marker-symbol"] = "yellowMarker";
            } else {
                geodata.features[i].properties["marker-symbol"] = "greenMarker";
            }

            that.geoDataMap[geodata.features[i].properties.title] = geodata.features[i];
        }

        // a fast webgl (I think) geoJSON layer which will hopefully allow us to add millions of points
        // with little performance hit
        geoJSONSource = new mapboxgl.GeoJSONSource({
            data: geodata,
            cluster: that.clustered,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

        // IGNORE add in our markers
        /*map.addSource("markers", {
            "type": "geojson",
            "data": geodata
        });*/

        var id = "markers" + currentPoint;

        that.layers.push(id); // keep track of our layers

        that.map.addSource(id, geoJSONSource);
        that.map.addLayer({
            "id": id,
            "interactive": true,
            "type": "symbol",
            "source": id,
            "layout": {
                "icon-image": "{marker-symbol}", // stuff in {} gets replaced by the corresponding value
                "icon-allow-overlap": true,
                "icon-size": 0.1 // size of the icon
            }
        });
        currentPoint++;
        var fileToLoad = filename + currentPoint + ".json";

        if (currentPoint <= 20) {
            loadJSONFunc(fileToLoad, that.JSONCallback);
        }
    }

    var that = this;

    this.addMapToPage = function(containerID) {
        that.map = new mapboxgl.Map({
            container: containerID, // container id
            style: 'style.json', //stylesheet location
            center: [130.89, 31.89], // starting position
            zoom: 9 // starting zoom
        });

        that.map.once("draw.deleted", e => {
            console.log("hi");
        });

        that.map.addControl(new mapboxgl.Navigation());
        // what to do after the map loads
        that.map.once("load", function load() {
            // drawer to draw a square and select points
            that.drawer = mapboxgl.Draw();
            that.map.addControl(that.drawer);

            var fileToLoad = filename + currentPoint + ".json";
            // load in our sample json
            loadJSONFunc(fileToLoad, that.JSONCallback);
        });



        var popup = new mapboxgl.Popup();

        // When a click event occurs near a marker icon, open a popup at the location of
        // the feature, with description HTML from its properties.
        that.map.on('click', function(e) {
            for (var i = 0; i < that.layers.length; i++) {
                that.map.featuresAt(e.point, {
                    radius: 7.5, // Half the marker size (15px).
                    includeGeometry: true,
                    layer: that.layers[i]
                }, function(err, features) {
                    //console.log("this is features",features);
                    if (err || !features.length) {
                        popup.remove();
                        return;
                    }

                    var feature = features[0];
                    var title = feature.properties.title;

                    // the features array seems to have a copy of the actual features, and not the real original
                    // features that were added. Thus, I use the title of the feature as a key to lookup the
                    // pointer to the actual feature we added, so changes made to it can be seen on the map.
                    // that is just a test, so whenever a marker is clicked, the marker symbol is changed to a
                    // different one before showing it's information in a popup.
                    var actualFeature = that.geoDataMap[title];

                    //actualFeature.properties["marker-symbol"] = "yellowMarker";
                    actualFeature.properties["marker-color"] = "#ff8888";

                    geoJSONSource.setData(geodata);

                    // Populate the popup and set its coordinates
                    // based on the feature found.
                    /*  popup.setLngLat(feature.geometry.coordinates)
                          .setHTML("lat " + feature.geometry.coordinates[1] + ", long " + feature.geometry.coordinates[0])
                          .addTo(map);*/
                    /*popup.setLngLat(feature.geometry.coordinates)
                        .setHTML("<div id='chartDiv'><canvas id='chart'></canvas></div>")
                        .addTo(map);*/

                    /*var pieData = [{
                        value: 20,
                        color: "#878BB6"
                    }, {
                        value: 40,
                        color: "#4ACAB4"
                    }, {
                        value: 10,
                        color: "#FF8153"
                    }, {
                        value: 30,
                        color: "#FFEA88"
                    }];*/

                    var lineData = {
                        labels: ["January", "February", "March", "April", "May", "June", "July"],
                        datasets: [{
                            label: "My Second dataset",
                            fillColor: "rgba(151,187,205,0.2)",
                            strokeColor: "rgba(151,187,205,1)",
                            pointColor: "rgba(151,187,205,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(151,187,205,1)",
                            //data: [28, 48, 40, 19, 86, 27, 90]
                            //data: randomArray()
                            data: features[0].properties.myData
                        }]
                    };

                    var options = {};

                    var ctx = document.getElementById("chart").getContext("2d");
                    var lineChart = new Chart(ctx).Line(lineData, options);
                    //var myNewChart = new Chart(ctx).Pie(pieData);
                });
            }
        });

        // Use the same approach as above to indicate that the symbols are clickable
        // by changing the cursor style to 'pointer'.
        that.map.on('mousemove', function(e) {
            for (var i = 0; i < that.layers.length; i++) {
                var layer = that.layers[i];

                that.map.featuresAt(e.point, {
                    radius: 7.5, // Half the marker size (15px).
                    layer: layer
                }, function(err, features) {
                    that.map.getCanvas().style.cursor = (!err && features.length) ? 'pointer' : '';
                });
            }
        });

        // handle zoom changed. we want to change the icon-size in the layer for varying zooms.
        // if you notice, in tremaps, all the points are just one size, as if they were real, physical points.
        // so, when you zoom out, the points appear to be smaller than when you are zoomed in. with the markers
        // we are using, though, the marker icons are always the same size, so we can use that function to
        // dynamically change the sizes depending on the current map zoom.
        that.map.on('zoomend', function() {
            // here's where you decided what zoom levels the layer should and should
            // not be available for: use javascript comparisons like < and > if
            // you want something other than just one zoom level, like
            // (map.getZoom > 10)
            console.log(that.map.getZoom());
            if (that.map.getZoom() > 13) {
                // remove the old layer with large markers and add a new one with small markers
                for (var i = 0; i < that.layers.length; i++) {
                    var id = that.layers[i];

                    if (that.map.getLayer(id)) {
                        that.map.removeLayer(id);
                    }

                    that.map.addLayer({
                        "id": id,
                        "interactive": true,
                        "type": "symbol",
                        "source": id,
                        "layout": {
                            "icon-image": "{marker-symbol}",
                            "icon-allow-overlap": true,
                            "icon-size": 0.4 // notice the new, larger size at higher zoom levels
                        }
                    });
                }
            } else {
                // if there is a layer with that name, remove it before adding
                for (var i = 0; i < that.layers.length; i++) {
                    var id = that.layers[i];

                    if (that.map.getLayer(id)) {
                        that.map.removeLayer(id);
                    }

                    that.map.addLayer({
                        "id": id,
                        "interactive": true,
                        "type": "symbol",
                        "source": id,
                        "layout": {
                            "icon-image": "{marker-symbol}",
                            "icon-allow-overlap": true,
                            "icon-size": 0.1 // notice the bigger size at smaller zoom levels.
                        }
                    });
                }
            }
        });
        // TODO: the above function can be made much more granular with more else if's
    }
}

// Test function that generates an array of random numbers. Simulates each point on map having their own data.
function randomArray() {
    var myArray = [];

    for (var i = 0; i < 7; i++) {
        myArray.push(Math.floor(Math.random() * (50 - 1 + 1)) + 1);
    }

    return myArray;
}


// function to use AJAX to load json from that same website - I looked online and AJAX is basically just used
// to asynchronously load data using javascript from a server, in our case, our local website
function loadJSON(filename, callback) {
    console.log(filename);
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}


// TODO: the above function can be made much more granular with more else if's
var myMap = new Map(loadJSON);
myMap.addMapToPage("map-container");
