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

function findPairs (string) {
    const pairs = [];
    for (let i = 0; i < string.length - 1; i++) {
        pairs.push(`${string[i]}${string[i + 1]}`)
    }
    return pairs;
}

const MAX_DEPTH = 10;

async function process() {
    const [start, instructions] = parseLines(await getInput())

    function processPair (pair) {
        const next = `${pair[0]}${instructions[pair]}${pair[1]}`
        return next;
    }

    function unPair(pair) {
        return pair[0] + pair[1][1];
    }

    function handlePairs(pairs, depth = 0) {
        if (depth === MAX_DEPTH) {
            return unPair(pairs);
        }

        return pairs.map(pair => {
            // pair: 'AB', next: 'ACB', nextPairs: [AC, CB]
            const next = processPair(pair);
            const nextPairs = findPairs(next);

            return handlePairs(nextPairs, depth + 1);
        })
    }

    function removeExtra(arr) {
        return [arr[0], ...arr.slice(1).map(x => x.slice(1))].join('');
    }

    const result = removeExtra(handlePairs(findPairs(start)).flat(MAX_DEPTH));

    const elements = result.split('').reduce((acc, e) => {
        return { ...acc, [e]: (acc[e] || 0) + 1 }
    }, {});

    const [min, max] = Object.values(elements).reduce((acc, value) => {
        return [ Math.min(acc[0], value), Math.max(acc[1], value) ];
    }, [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])

    console.log({ min, max, result: max - min })

}

process();