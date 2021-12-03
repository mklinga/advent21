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

function calculateIncreases (input) {
    let increases = 0;
    let not = 0;
    console.log(input.length)
    for (let i = 1; i < input.length; i++) {
        if (Number(input[i - 1]) < Number(input[i])) {
            increases++;
        } else {
            not++;
        }
    }

    console.log(increases, not);
    return increases;
}

async function process() {
    const input = await getInput();
    if (!Array.isArray(input)) {
        throw new Error('Input is not an array!')
    }

    const increases = calculateIncreases(input);

    console.log('increases:', increases);
}

process();