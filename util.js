var DEFAULT_AOI_COLOR      = 'rgba(255, 0, 0, 1)'
var DEFAULT_AOI_FILL_COLOR = 'rgba(255, 0, 0, 0.2)'
var DEFAULT_SENSOR_COLOR   = 'rgba(0, 0, 0, 1)'


var N  = 100 // total sensors in field

var R  = 100  // uniform circular sensing range in pixels : RADIUS

var GS = 10  // uniform circular sensing range in pixels

var M  = 50

var GROWING_MUTATION_RATE  = 0.05
var CRITICAL_MUTATION_RATE = 0.05
var RETROGRADE_MUTATION_RATE  = 0.01
var EVOLUTIONARY_MUTATION_RATE  = 0.08

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
        x: 600,
        y: 600
    }
}

var COVER_FIELDS = {}

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
                var cell_id = i * (height / GS) + j
                sensor.covers_cells.push( cell_id )

                if( COVER_FIELDS[cell_id] ){
                    COVER_FIELDS[cell_id].push( sensors.length )
                }else{
                    COVER_FIELDS[cell_id] = [sensors.length]
                }

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

function Chromosome(isBlank){
    this.schedule_numbers = []
    this.remaining_lifetime_o_sensors = []

    if (isBlank){
        this.cover_set_stats = []
    }else{
        this.cover_set_stats  = [{
            cover_set                  : [],
            lifetime                   : 0,
            coverage                   : 0,
        }]
    }

    this.fitness = null

    if(!isBlank){
        for(var i = 0; i < N; i++){
            this.schedule_numbers.push([0])
            this.cover_set_stats[0].cover_set.push(i)
        }
    }

    this.setupCoverSetsFromScheduleNumbers = function () {

        for (var sensor_id in this.schedule_numbers) {
            sensor_id = parseInt( sensor_id )

            for (var sched_no of this.schedule_numbers[ sensor_id ]) {

                if (this.cover_set_stats[sched_no]) {
                    this.cover_set_stats[sched_no].cover_set.push( sensor_id )
                } else {
                    this.cover_set_stats[sched_no] = {
                        cover_set: [ sensor_id ],
                        lifetime: 0,
                        coverage: 0
                    }
                }

            }
        }

    }

    this.prepareCoverSetStats = function(){ 
        var lifetime_o_sensors = sensors.map((sensor)=> sensor.battery_life)
        
        var width = BOUNDS.bottomRight.x - BOUNDS.topLeft.x
        var height = BOUNDS.bottomRight.y - BOUNDS.topLeft.y
        
        var total_grid_cells = (width / GS) * (height / GS)


        for(var i in this.cover_set_stats){
            i = parseInt(i)

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

            this.remaining_lifetime_o_sensors = lifetime_o_sensors
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
        var w1 = 0.8
        var w2 = 0.2

        var lifetime_upper_limit = N * BATTERY_LIFE.max
        var lifetime = 0
        var coverage = 0

        for(var cover_set_idx in this.cover_set_stats){
            var cover_set = this.cover_set_stats[ parseInt(cover_set_idx) ]

            lifetime += cover_set.lifetime
            coverage += cover_set.coverage
        }

        this.fitness = w1*(lifetime / lifetime_upper_limit) + w2*(coverage / this.cover_set_stats.length)
    }

    this.applyMutation = function(){

        this.applyGrowingMutation()
        this.applyEvolutionaryMutation()
        this.applyCriticalMutation()
        this.applyRetrogradeMutation()
        
    }

    this.refreshLifetimeAndCoverage = function () {
        this.setupCoverSetsFromScheduleNumbers()

        this.prepareCoverSetStats()
    }

    this.getRandomIncompleteCoverSet = function(to_ignore){
        // coverage full naa ho and ignore naa karna ho to hi incomplete mein daalo
        to_ignore = to_ignore ? to_ignore : []
        
        var incomplete = this.cover_set_stats.filter( (set) => (set.coverage < 1) && !(to_ignore.includes(this.cover_set_stats.indexOf(set) )) )
        
        return incomplete[ getRandomInt(0, incomplete.length-1) ]
    }

    this.getRandomCompleteCoverSet = function (to_ignore) {
        to_ignore = to_ignore ? to_ignore : []

        var incomplete = this.cover_set_stats.filter((set) => (set.coverage == 1) && !(to_ignore.includes(this.cover_set_stats.indexOf(set))) )

        return incomplete[getRandomInt(0, incomplete.length - 1)]
    }

    this.applyGrowingMutation = function(){
        
        for (var sensor_id = 0; sensor_id < N; sensor_id++){
            if(this.remaining_lifetime_o_sensors[sensor_id] <= 0) continue
            
            var r = Math.random()

            if (r >= GROWING_MUTATION_RATE) continue

            console.log("grow mutation")

            var add_or_change = Math.random()

            if(add_or_change < 0.01){
                this.schedule_numbers[sensor_id].push( this.cover_set_stats.length )
            }else{
                var incomplete = this.getRandomIncompleteCoverSet( this.schedule_numbers[sensor_id] )

                if(incomplete == undefined){
                    continue
                }

                this.schedule_numbers[sensor_id][
                    getRandomInt(0, this.schedule_numbers[sensor_id].length - 1)
                ] = this.cover_set_stats.indexOf(incomplete)
            }
        }

    }

    this.applyEvolutionaryMutation = function(){
        //cover set wise iterate
        for (var cover_set_id in this.cover_set_stats) {
            cover_set_id = parseInt( cover_set_id )

            if(this.cover_set_stats[cover_set_id].coverage < 1) continue

            var r = Math.random()

            if (r >= EVOLUTIONARY_MUTATION_RATE) continue

            console.log("evol mutation")

            var fields_covered = []

            var sensor_data = sensors.filter((sensor, idx) => this.cover_set_stats[cover_set_id].cover_set.includes(idx) )

            sensor_data.sort( (a, b)=>{
                return a.covers_cells.length > b.covers_cells.length
            })

            var redundants = []

            for (var sensor of sensor_data){
                if (sensor.covers_cells.filter((cell_id) => fields_covered.includes(cell_id)).length == sensor.covers_cells.length){
                    redundants.push( sensor )
                }else{
                    fields_covered.push( ...sensor.covers_cells )
                }
            }


            var redundant_id = sensors.indexOf( redundants[getRandomInt(0, redundants.length - 1)] )

            var incomplete = this.getRandomIncompleteCoverSet()

            if (incomplete == undefined) {
                continue
            }

            this.schedule_numbers[redundant_id][
                this.schedule_numbers[redundant_id].indexOf( cover_set_id )
            ] = this.cover_set_stats.indexOf(incomplete)
        }

    }

    this.applyCriticalMutation = function(){
        var r = Math.random()

        if( r >= CRITICAL_MUTATION_RATE ) return
        
        console.log("critical mutation")

        var incomplete_set = this.getRandomIncompleteCoverSet()

        if (incomplete_set == undefined) {
            return
        }

        var fields_covered = []

        for (var sensor_ref of incomplete_set.cover_set) {
            fields_covered.push(...sensors[sensor_ref].covers_cells)
        }

        for (var idx in SENSORS_IN_CRITICAL_FIELD) {
            idx = parseInt(idx)

            if (SENSORS_IN_CRITICAL_FIELD[idx].cell_id in fields_covered) {

            } else {

                var complete = this.getRandomCompleteCoverSet()

                if (complete == undefined) {
                    continue
                }

                var intersect = SENSORS_IN_CRITICAL_FIELD[idx].sensors.filter(value => complete.cover_set.includes(value))

                if (intersect.length > 1) {
                    this.schedule_numbers[intersect[0]][
                        this.schedule_numbers[intersect[0]].indexOf(this.cover_set_stats.indexOf(complete))
                    ] = this.cover_set_stats.indexOf(incomplete_set)
                }

                break
            }

        }
    }

    this.applyRetrogradeMutation = function(){
        var r = Math.random()

        if (r >= RETROGRADE_MUTATION_RATE ) return

        console.log( "retrograde mutation" )

        var incomplete = this.getRandomIncompleteCoverSet()

        if (incomplete == undefined) {
            return
        }

        var complete = this.getRandomCompleteCoverSet()

        if (complete == undefined) {
            return
        }



        var diff = incomplete.cover_set.filter(value => !complete.cover_set.includes(value))

        if(diff.length == 0) return

        // random_incomplete_sensor_which_not_in_complete
        var sensor = diff[ getRandomInt(0, diff.length - 1) ]

        this.schedule_numbers[ sensor ][
            this.schedule_numbers[ sensor ].indexOf(this.cover_set_stats.indexOf(incomplete))
        ] = this.cover_set_stats.indexOf(complete)
    }

}

