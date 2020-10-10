var sensors = []
var lifetime_redundant_sensors = []

function setup(){
    createCanvas(window.innerWidth, window.innerHeight)
    
    clear()
    background(220, 220, 220)
}

function paint(){
    clear()
    background(220, 220, 220)

    stroke(255)
    noFill()

    var width  = BOUNDS.bottomRight.x - BOUNDS.topLeft.x
    var height = BOUNDS.bottomRight.y - BOUNDS.topLeft.y

    // vertical lines
    for(var i = 0; i <= width / GS; i++){
        stroke(0, 0, 255)
        line(BOUNDS.topLeft.x + GS * i, BOUNDS.topLeft.y, BOUNDS.topLeft.x + GS * i, BOUNDS.bottomRight.y)
    }
    
    // horizontal lines
    for(var i = 0; i <= height / GS; i++){
        stroke(0, 0, 255)
        line(BOUNDS.topLeft.x, BOUNDS.topLeft.y + GS * i, BOUNDS.bottomRight.x, BOUNDS.topLeft.y + GS * i)
    }

    stroke(0)
    for (var sensor of sensors) {
        stroke(DEFAULT_AOI_COLOR)
        fill(DEFAULT_AOI_FILL_COLOR)
        circle(sensor.coords.x, sensor.coords.y, sensor.range * 2)

        stroke(DEFAULT_SENSOR_COLOR)
        circle(sensor.coords.x, sensor.coords.y, 2)
    }
}

function generateRandomSensors(){
    sensors = []
    for (var i = 0; i < N; i++) {
        sensors.push(createRandomSensor())
    }
}