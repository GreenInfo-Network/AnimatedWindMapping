var START_LON = -145.0;
var START_LAT =   40.38;
var START_ZUM = 4;


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

    MAP.on('movestart',function(){
        $('#CursorLayer').hide();
    });
    MAP.on('moveend',function(){
        $('#CursorLayer').show();
        redrawWind();
    });
});


var windy, GFS_JSON, CANVS, cursorLayer;
function initWind() {
    $.getJSON("wind-surface-level-gfs.json", function(data) {
        GFS_JSON = data;

        var CANVS = document.createElement('canvas');

        CANVS.id = "CursorLayer";
        CANVS.width = $('#map').width();
        CANVS.height = $('#map').height();
        CANVS.style.zIndex = 9;
        CANVS.style.position = "absolute";
        //CANVS.style.border = "3px solid red";

        var body = document.getElementById("map");
        body.appendChild(CANVS);

        /*CANVS = $('<div id="CursorLayer" style="position: absolute;"></div>').width( $('#map').width() ).height( $('#map').height() );

        $('#map').append(CANVS);
        */
        cursorLayer = document.getElementById("CursorLayer");

        windy = new Windy({ canvas: CANVS, data: GFS_JSON });
        //windy = new Windy({ canvas: cursorLayer, data: GFS_JSON });

        var bnds = MAP.getBounds();

        setTimeout(function(){
            windy.start(
              [[0,0],[$('#map').width(), $('#map').height()]], 
              $('#map').width(), 
              $('#map').height(), 
              [[bnds.getWest(), bnds.getSouth()],[bnds.getEast(), bnds.getNorth()]]
            );
          },5000);  
    
        redrawWind();

    });
}


function redrawWind(){
    //console.log('redrawWind');
    windy.stop();
    
    var bnds = MAP.getBounds();
    var z = MAP.getZoom();

    // no: $('#CursorLayer').width( $('#map').width() ).height( $('#map').height() );
    $('#CursorLayer').attr('width', $('#map').width() ).attr('height', $('#map').height() );
    
    // empirical tests at z={3,6,9} with linear or power curve fit
    //VELOCITY_SCALE = 1/ (6800 * z * z);             // scale for wind velocity (completely arbitrary--this value looks nice)
    VELOCITY_SCALE = 1/ (3400 * z * z);             // scale for wind velocity (completely arbitrary--this value looks nice)
    PARTICLE_LINE_WIDTH = 0.167*z + 0.267;              // line width of a drawn particle
    PARTICLE_MULTIPLIER = 32 * Math.pow(z,-1.28);              // particle count scalar (completely arbitrary--test)
    PARTICLE_REDUCTION = 11.5 * Math.pow(z,-2.4);              // reduce particle count to this much of normal for mobile devices
    MAX_WIND_INTENSITY = 10;              // wind velocity at which particle intensity is maximum (m/s)
    MAX_PARTICLE_AGE = 10;                // max number of frames a particle is drawn before regeneration

    setTimeout(function(){
        windy.start(
          [[0,0],[$('#map').width(), $('#map').height()]], 
          $('#map').width(), 
          $('#map').height(), 
          [[bnds.getWest(), bnds.getSouth()],[bnds.getEast(), bnds.getNorth()]]
        );
      },500);  
}
