var POPULATION  = []

function generate(){

    var new_population = []

    var sum = 0
    var max = 0
    var min = 1

    for(var i = 0; i < M; i++){
        var parentA = POPULATION[ getRandomInt(0, POPULATION.length - 1) ]
        var parentB = POPULATION[ getRandomInt(0, POPULATION.length - 1) ]
        
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
     
        new_population.push(blank_child)

        sum += blank_child.fitness

        if (blank_child.fitness > max){
            max = blank_child.fitness
        }
        if (blank_child.fitness < min){
            min = blank_child.fitness
        }

    }

    POPULATION = new_population
    console.warn("AVG: "+ sum/M)
    console.warn("MAX: "+ max)
    console.warn("MIN: "+ min)
}



function generation_controller(){

    generate()
    // stats nikalo population ke in future

}
