var sensors = []
var lifetime_redundant_sensors = []
var SENSORS_IN_CRITICAL_FIELD = []

var INIT_SOLN = null

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

    //setup for finding critical sensors
    var keys_in_cf = Object.keys(COVER_FIELDS)
    var min_record = Math.min( ...keys_in_cf.map((key) => COVER_FIELDS[key].length  ) )
    var best = keys_in_cf.filter( (key)=>COVER_FIELDS[key].length == min_record )

    SENSORS_IN_CRITICAL_FIELD = []
    for(var idx of best){
        SENSORS_IN_CRITICAL_FIELD.push( { cell_id: idx, sensors: COVER_FIELDS[idx]} )
    }
    COVER_FIELDS = {}

    INIT_SOLN = new Chromosome(false)
    INIT_SOLN.prepareCoverSetStats()
    INIT_SOLN.calculateFitness()

    MATING_POOL.push(INIT_SOLN)
}
