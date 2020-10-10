var DEFAULT_AOI_COLOR      = 'rgba(255, 0, 0, 1)'
var DEFAULT_AOI_FILL_COLOR = 'rgba(255, 0, 0, 0.2)'
var DEFAULT_SENSOR_COLOR   = 'rgba(0, 0, 0, 1)'


var N  = 100 // total sensors in field

var R  = 20  // uniform circular sensing range in pixels : RADIUS

var GS = 10  // uniform circular sensing range in pixels

var GROWING_MUTATION_RATE = 0.05

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
        },
        covers_cells: [],
    }

    var width = BOUNDS.bottomRight.x - BOUNDS.topLeft.x
    var height = BOUNDS.bottomRight.y - BOUNDS.topLeft.y

    for(var i = 0; i < width / GS; i++){

        for(var j = 0; j < height / GS; j++){
            // clockwise from top left

            var p1 = {
                x: BOUNDS.topLeft.x + i * GS,
                y: BOUNDS.topLeft.y + j * GS,
            }
            
            var p2 = {
                x: BOUNDS.topLeft.x + (i + 1) * GS, 
                y: BOUNDS.topLeft.y + j * GS,
            }

            var p3 = {
                x: BOUNDS.topLeft.x + (i+1) * GS,
                y: BOUNDS.topLeft.y + (j+1) * GS,
            }
            
            var p4 = {
                x: BOUNDS.topLeft.x + i * GS,
                y: BOUNDS.topLeft.y + (j+1) * GS,
            }
    
            var pts = [p1, p2, p3, p4]

            var anyone_not_in_range = false;

            for(var pt of pts){
                if(R ** 2 < (pt.x - sensor.coords.x) ** 2 + (pt.y - sensor.coords.y) ** 2 ){
                    anyone_not_in_range = true;

                    break;
                }
            }

            if(! anyone_not_in_range){
                sensor.covers_cells.push( i * (height/GS) + j )
            }
    
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
        
        var width = BOUNDS.bottomRight.x - BOUNDS.topLeft.x
        var height = BOUNDS.bottomRight.y - BOUNDS.topLeft.y
        
        var total_grid_cells = (width / GS) * (height / GS)


        for(var i = 0; i < this.cover_set_stats.length; i++){
            var sensors_in_this_cover_set = this.cover_set_stats[i].cover_set
            var index = getMinLifetimeWalaSensor( sensors_in_this_cover_set )
            
            this.cover_set_stats[i].lifetime = lifetime_o_sensors[ index ]
            this.cover_set_stats[i].coverage = 0
            var cells_covered_by_this_cover_set = []

            for(var j = 0; j < sensors_in_this_cover_set.length; j++){

                /*
                    for eg if there are 3 sensors in total with lifetimes [50, 60, 70]  [0, 60, 20]
                    if a cover set has [0, 2] sensors
                    the following statement will be resolved as

                    each element in the cover_set denotes an index value for the global sensors ka array and uske related jo bhi rahege vo eg (lifetime_o_sensors)
                */
                lifetime_o_sensors[ sensors_in_this_cover_set[j] ] -= lifetime_o_sensors[index]

                cells_covered_by_this_cover_set.push( ...sensors[sensors_in_this_cover_set[j]].covers_cells )
            }

            cells_covered_by_this_cover_set = cells_covered_by_this_cover_set.filter((value, index, self)=>{
                return self.indexOf(value) == index
            })
            this.cover_set_stats[i].coverage = cells_covered_by_this_cover_set.length / total_grid_cells

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

        var lifetime_upper_limit = N * BATTERY_LIFE.max        
        var lifetime = 0
        var coverage = 0

        for(var cover_set of this.cover_set_stats){
            lifetime += cover_set.lifetime
            coverage += cover_set.coverage
        }

        this.fitness = w1*(lifetime / lifetime_upper_limit) + w2*(coverage / this.cover_set_stats.length)
    }

    this.applyMutation = function(){
        for (var i = 0; i < this.cover_set_stats.length; i++) {
            var sensors_in_this_cover_set = this.cover_set_stats[i].cover_set
            var this_cover_set_stat       = this.cover_set_stats[i]

            for (var j = 0; j < sensors_in_this_cover_set.length; j++) {
                var sensor = sensors_in_this_cover_set[j]
                
                // APPLY GROWING MUTATION
                if (sensors[sensor].battery_life > this_cover_set_stat.lifetime) { //check if this sensor is lifetime redundant

                    //try to trigger GROWING MUTATION
                    if (Math.random() < GROWING_MUTATION_RATE){
                        console.log( this.schedule_numbers[ sensor ] )
                    }

                }

                // APPLY EVOL MUTATION

                // APPLY RETROGRADE MUTATION

                // APPLY CRITICAL MUTATION
            }

        }    
    }
}

