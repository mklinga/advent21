const fs = require('fs');

function getInput() { 
    return new Promise((resolve, reject) => {
        fs.readFile('./input1.txt', {}, (err, data) => {
            if (err) {
                return reject(err);
            }

            resolve(data.toString().split('\n'));
        });
    });
}

async function process() {
    const input = await getInput();
    if (!Array.isArray(input)) {
        throw new Error('Input is not an array!')
    }

    const positions = input[0].trim().split(',').map(x => parseInt(x)).reduce((acc, p) => ({ ...acc, [p]: (acc[p] || 0) + 1 }), {});

    const largest = Math.max.apply(null, Object.keys(positions));
    let least = { x: undefined, sum: Number.POSITIVE_INFINITY };
    for (let x = 0; x < largest; x++) {
        const fuel = Object.entries(positions).reduce((sum, [k, v]) => {
            return sum + (v * Math.abs(k - x));
        }, 0);
        if (fuel < least.sum) {
            least = { sum: fuel, number: x };
        }
    }

    console.log('least', least)
}

process();