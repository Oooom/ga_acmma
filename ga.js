var POPULATION  = []
var RANKS       = []
var BEST        = []

function generate(){
    
    var new_population = []
    
    var sum = 0
    var max = 0
    var min = 1
    
    //first iteration
    if(POPULATION.length == 1){

        for(var i = 0; i < M - 1; i++){
            var blank_child = new Chromosome(true)

            for (var j = 0; j < N; j++) {

                blank_child.schedule_numbers.push(INIT_SOLN.schedule_numbers[j].map((sched_no) => sched_no))

            }

            blank_child.refreshLifetimeAndCoverage()

            blank_child.applyMutation()

            blank_child.refreshLifetimeAndCoverage()

            blank_child.calculateFitness()

            new_population.push(blank_child)

            sum += blank_child.fitness

            if (blank_child.fitness > max) {
                max = blank_child.fitness
            }
            if (blank_child.fitness < min) {
                min = blank_child.fitness
            }
        }

    }else{

        //all other iterations
        for(var i = 0; i < M - M*0.2; i++){
            var parentA = RANKS[getRandomInt(0, (RANKS.length / 1.5) - 1)]
            var parentB = RANKS[getRandomInt(0, (RANKS.length / 1.5) - 1)]

            var a_rank = RANKS.length - RANKS.indexOf(parentA)
            var b_rank = RANKS.length - RANKS.indexOf(parentB)
    
            var blank_child = new Chromosome(true)
    
            var parentAThreshold = a_rank / (a_rank + b_rank)
    
            for (var j = 0; j < N; j++){
    
                if(Math.random() < parentAThreshold){
                    blank_child.schedule_numbers.push( parentA.schedule_numbers[j].map((sched_no) => sched_no) )
                }else{
                    blank_child.schedule_numbers.push( parentB.schedule_numbers[j].map((sched_no) => sched_no) )
                }
    
            }
    
            blank_child.refreshLifetimeAndCoverage()
    
            blank_child.applyMutation()
            
            blank_child.refreshLifetimeAndCoverage()
            
            blank_child.calculateFitness()
         
            new_population.push(blank_child)
    
            sum += blank_child.fitness
    
            if (blank_child.fitness > max){
                max = blank_child.fitness
            }
            if (blank_child.fitness < min){
                min = blank_child.fitness
            }
    
        }

    }




    POPULATION = new_population

    calculateRank()

    console.warn("AVG: "+ sum/M)
    console.warn("MAX: "+ max)
    console.warn("MIN: "+ min)
}

function calculateRank(){
    //first iteration mein skip
    if(BEST.length > 0){
        POPULATION.push( ...BEST )
    }
    
    RANKS = POPULATION.map( (val)=>val )
    
    RANKS.sort( (a, b)=>a.fitness>b.fitness )

    RANKS.splice(M, RANKS.length - M)
    POPULATION.splice(M, POPULATION.length - M)

    BEST = []

    for(var i = 0; i < M*0.2; i++){
        BEST.push(RANKS[i])
    }
}


function generation_controller(){

    generate()
    // stats nikalo population ke in future

}
