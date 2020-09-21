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
    rect(BOUNDS.topLeft.x, BOUNDS.topLeft.y, BOUNDS.bottomRight.x - BOUNDS.topLeft.x, BOUNDS.bottomRight.y - BOUNDS.topLeft.y)

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