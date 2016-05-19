var START_LON = -145.0;
var START_LAT =   40.38;
var START_ZUM = 4;

var WINDY, CANVAS;

$(document).ready(function () {
    // whoa there! No Canvas, no can do!
    if (! document.createElement("canvas").getContext ) return alert("Sorry, this is for Canvas-enabled browsers.");

    // the map and the only baselayer
    MAP = L.map('map', {
        attributionControl: false
    }).setView([START_LAT, START_LON], START_ZUM);
    L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png').addTo(MAP);

    // the GreenInfo credits in the corner
    $('#ginCreditsContainer').hover(function(){
        $('#ginCreditsText').toggle(); 
    });

    initWind();

    MAP.on('moveend',function(){
        redrawWind();
    });
});

function initWind() {
    $.getJSON("wind-surface-level-gfs.json", function(data) {
        var gfsdata = data;

        CANVAS = document.createElement('canvas');

        CANVAS.id = "CursorLayer";
        CANVAS.width = $('#map').width();
        CANVAS.height = $('#map').height();
        CANVAS.style.zIndex = 9;
        CANVAS.style.position = "absolute";
        document.getElementById("map").appendChild(CANVAS);

        WINDY = new Windy({ canvas: CANVAS, data: gfsdata });

        // and kick it off!
        redrawWind();
    });
}

function redrawWind(){
    WINDY.stop();

    var bnds   = MAP.getBounds();
    var z      = MAP.getZoom();
    var width  = $('#map').width();
    var height = $('#map').height();

    CANVAS.width  = width;
    CANVAS.height = $('#map').height();

    VELOCITY_SCALE = 1/ (3400 * z * z);             // scale for wind velocity (completely arbitrary--this value looks nice)
    PARTICLE_LINE_WIDTH = 0.167*z + 0.267;          // line width of a drawn particle
    PARTICLE_MULTIPLIER = 32 * Math.pow(z,-1.28);   // particle count scalar (completely arbitrary--test)
    PARTICLE_REDUCTION = 11.5 * Math.pow(z,-2.4);   // reduce particle count to this much of normal for mobile devices
    MAX_WIND_INTENSITY = 10;                        // wind velocity at which particle intensity is maximum (m/s)
    MAX_PARTICLE_AGE = 10;                          // max number of frames a particle is drawn before regeneration

    WINDY.start(
        [[0,0],[width, height]],
        width, 
        height, 
        [[bnds.getWest(), bnds.getSouth()],[bnds.getEast(), bnds.getNorth()]]
    );
}
