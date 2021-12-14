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

function parseLines(input) {
    const start = input[0].split('');
    const instructions = input.slice(2).reduce((acc, instruction) => {
        const [ from, to ] = instruction.split(' -> ');
        return { ...acc, [from]: to };
    }, {});
    return [start, instructions];
}

const MAX_DEPTH = 40;

async function process() {
    const [polymer, instructions] = parseLines(await getInput())
    
    let counts = {};
    for (let i = 0; i < polymer.length - 1; i++) {
        const pair = polymer[i] + polymer[i + 1];
        counts[pair] = (counts[pair] || 0) + 1;
    }

    for (let depth = 0; depth < MAX_DEPTH; depth++) {
        let nextCounts = {};
        // Each pair splits into two new pairs
        Object.entries(counts).forEach(([ key, value]) => {
            const newChar = instructions[key[0] + key[1]];
            const pair1 = key[0] + newChar;
            const pair2 = newChar + key[1];

            nextCounts[pair1] = (nextCounts[pair1] || 0) + value;
            nextCounts[pair2] = (nextCounts[pair2] || 0) + value;
        })

        counts = {...nextCounts};
    }
    
    const keyValues = Object.entries(counts).reduce((acc, [ key, value ]) => {
        const [ letter1, letter2 ] = key.split('');
        acc[letter1] = (acc[letter1] || 0) + value / 2;
        acc[letter2] = (acc[letter2] || 0) + value / 2;
        return acc;
    }, {})

    // Since all the other values are duplicated except the first and the last item, we'll add them to the sum here
    const [first, last] = [polymer[0], polymer[polymer.length - 1]];
    keyValues[first] += 0.5;
    keyValues[last] += 0.5;

    const [ min, max ] = Object.values(keyValues).reduce((acc, value) => {
        return [ Math.min(acc[0], value), Math.max(acc[1], value) ];
    }, [ Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY ])
    
    console.log({ min, max, result: max - min })
}

process();