var DEFAULT_AOI_COLOR    = 'rgba(255, 0, 0, 1)'
var DEFAULT_AOI_FILL_COLOR = 'rgba(255, 0, 0, 0.2)'
var DEFAULT_SENSOR_COLOR = 'rgba(0, 0, 0, 1)'


var N = 100 // total sensors in field

var R = 20  // uniform circular sensing range in pixels

var BATTERY_LIFE = {
    min: 50,
    max: 100
}

var BOUNDS = {
    topLeft: {
        x: 200,
        y: 200
    },
    bottomRight: {
        x: 1200,
        y: 600
    }
}

function createRandomSensor(){
    var sensor = {
        range: R,
        battery_life: getRandomInt(BATTERY_LIFE.min, BATTERY_LIFE.max),
        coords : {
            x: getRandomInt(BOUNDS.topLeft.x, BOUNDS.bottomRight.x),
            y: getRandomInt(BOUNDS.topLeft.y, BOUNDS.bottomRight.y)
        }
    }

    return sensor;
}

function getRandomInt(min, max) {
    max = max + 1 // to make max inclusive varna niche waale code mein max was excluded
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}