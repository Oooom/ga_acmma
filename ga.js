var MATING_POOL = []
var POPULATION  = []

function generate(){
    
    for(var i = 0; i < M; i++){
        var parentA = MATING_POOL[ getRandomInt(0, MATING_POOL.length - 1) ]
        var parentB = MATING_POOL[ getRandomInt(0, MATING_POOL.length - 1) ]
        
        var blank_child = new Chromosome(true)

        var parentAThreshold = parentA.fitness / (parentA.fitness + parentB.fitness)

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
        
    }

}



function generation_controller(){

    generate()
    // stats nikalo population ke in future

}
