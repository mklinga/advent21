const fs = require('fs');

function getInput() { 
    return new Promise((resolve, reject) => {
        fs.readFile('./input1.txt', {}, (err, data) => {
            if (err) {
                return reject(err);
            }

            resolve(data.toString().split('\n').map(line => line.trim()));
        });
    });
}

const LINE_LENGTH = 10;

function getNeighbours(x) {
    const hasLeft = x % LINE_LENGTH !== 0;
    const hasRight = x % LINE_LENGTH !== LINE_LENGTH - 1;
    const hasTop = x >= LINE_LENGTH;
    const hasBottom = x < LINE_LENGTH * (LINE_LENGTH - 1);

    return {
        topLeft: hasTop && hasLeft ?  x - LINE_LENGTH - 1 : null,
        top: hasTop ?  x - LINE_LENGTH : null,
        topRight: hasTop && hasRight ?  x - LINE_LENGTH + 1 : null,
        right: hasRight ?  x + 1 : null,
        bottomRight: hasBottom && hasRight ?  x + LINE_LENGTH + 1 : null,
        bottom: hasBottom ?  x + LINE_LENGTH : null,
        bottomLeft: hasBottom && hasLeft ?  x + LINE_LENGTH - 1 : null,
        left: hasLeft ?  x - 1 : null,
    }
}

function printArray(i, a) {
    let arr = [...a];
    console.log('Step', i);
    while (arr.length > 0) {
        console.log(arr.splice(0, LINE_LENGTH).toString())
    }
}

function findAllFlashes(arr) {
    let result = [];
    arr.forEach((a, i) => {
        if (a > 9) {
            result.push(i);
        }
    })

    return result;
}

async function process() {
    const data = await getInput();

    let elementArray = data.reduce((acc, line) => acc.concat(line.split('').map(x => parseInt(x))), []);

    for (let step = 0; step < 500; step++) {
        // Add 1 to all
        elementArray = elementArray.map(x => x + 1);

        function findFlashes(arr, alreadyFlashed, flashCount) {
            // Find flashes
            const flashes = findAllFlashes(arr).filter(index => !alreadyFlashed.includes(index));
            if (flashes.length === 0) {
                // Set all flashed to 0
                alreadyFlashed.forEach(index => {
                    arr[index] = 0;
                })

                return flashCount;
            }

            alreadyFlashed = alreadyFlashed.concat(flashes);
            
            flashes.forEach(index => {
                const neighbours = getNeighbours(index);
                Object.values(neighbours).forEach(index => {
                    if (index === null) {
                        return;
                    }

                    arr[index] = arr[index] + 1;
                })
            })

            // find flashes again (recursion)
            return findFlashes(arr, alreadyFlashed, flashCount + flashes.length);
        }

        const flashCount = findFlashes(elementArray, [], 0);
        
        if (flashCount === LINE_LENGTH * LINE_LENGTH) {
            console.log('Result:', step + 1)
            return;
        }
    }
}

process();