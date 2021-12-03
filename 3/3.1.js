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

function calculateConsumption (input) {
    let bitResults;
    for (let lineIndex = 0; lineIndex < input.length; lineIndex++) {
        const line = input[lineIndex].trim();

        if (!bitResults) {
            bitResults = Array.from({ length: line.length }, () => ({ zeroes: 0, ones: 0 }));
        }

        for (let bitIndex = 0; bitIndex < line.length; bitIndex++) {
            if (line[bitIndex] === '0') {
                bitResults[bitIndex].zeroes++;
            } else if (line[bitIndex] === '1') {
                bitResults[bitIndex].ones++;
            }
        }
    }

    const [gamma, epsilon] = bitResults.reduce((acc, { zeroes, ones }) => {
        return [acc[0] + (zeroes > ones ? '0' : '1'), acc[1] + (zeroes > ones ? '1' : '0')]
    }, ['', '']);

    console.log(bitResults, gamma, epsilon)
    console.log('gamma:', parseInt(gamma, 2), 'epsilon:', parseInt(epsilon, 2));
    console.log('consumption', parseInt(gamma, 2) * parseInt(epsilon, 2))
}

async function process() {
    const input = await getInput();
    if (!Array.isArray(input)) {
        throw new Error('Input is not an array!')
    }

    const consumption = calculateConsumption(input);
}

process();