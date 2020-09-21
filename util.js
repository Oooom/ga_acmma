var DEFAULT_AOI_COLOR      = 'rgba(255, 0, 0, 1)'
var DEFAULT_AOI_FILL_COLOR = 'rgba(255, 0, 0, 0.2)'
var DEFAULT_SENSOR_COLOR   = 'rgba(0, 0, 0, 1)'


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

function Chromosome(){
    this.schedule_numbers = []
    this.cover_set_stats  = [{
        cover_set                  : [],
        lifetime                   : 0,
        coverage                   : 0,
    }]
    this.fitness = null

    for(var i = 0; i < N; i++){
        this.schedule_numbers.push([0])
        this.cover_set_stats[0].cover_set.push(i)
    }

    this.prepareCoverSetStats = function(){ 
        var lifetime_o_sensors = sensors.map((sensor)=> sensor.battery_life)
        
        for(var i = 0; i < this.cover_set_stats.length; i++){
            var sensors_in_this_cover_set = this.cover_set_stats[i].cover_set
            var index = getMinLifetimeWalaSensor( sensors_in_this_cover_set )
            
            this.cover_set_stats[i].lifetime = lifetime_o_sensors[ index ]

            for(var j = 0; j < sensors_in_this_cover_set.length; j++){

                /*
                    for eg if there are 3 sensors in total with lifetimes [50, 60, 70]  [0, 60, 20]
                    if a cover set has [0, 2] sensors
                    the following statement will be resolved as

                    each element in the cover_set denotes an index value for the global sensors ka array and uske related jo bhi rahege vo eg (lifetime_o_sensors)
                */
                lifetime_o_sensors[ sensors_in_this_cover_set[j] ] -= lifetime_o_sensors[index]

                // coverage ka idhar daalneka baaki hai
            }

            lifetime_redundant_sensors = lifetime_o_sensors.splice()
        }    

        function getMinLifetimeWalaSensor(sensors_in_this_cover_set){
            var sensors_mapped_lifetime = sensors_in_this_cover_set.map((sensorIndex) => lifetime_o_sensors[sensorIndex] )

            var min_index = 0

            for (var i = 1; i < sensors_mapped_lifetime.length; i++){
                if (sensors_mapped_lifetime[min_index] > sensors_mapped_lifetime[i]){
                    min_index = i
                }
            }

            return sensors_in_this_cover_set[ min_index ]
        }
    }

    this.calculateFitness = function(){
        var w1 = 0.7
        var w2 = 0.3

        var lifetime = 0
        var lifetime_upper_limit = N * BATTERY_LIFE.max        

        for(var cover_set of this.cover_set_stats){
            lifetime += cover_set.lifetime
            coverage += cover_set.coverage
        }

        this.fitness = w1*(lifetime / lifetime_upper_limit) + w2*(this.cover_set.coverage / this.cover_set_stats.length)
    }
}

