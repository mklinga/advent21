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

    const outputs = input.map(row => row.split('|')[1].trim());

    let easyNumbers = 0;
    let total = 0;

    outputs.forEach(output => {
        output.split(' ').forEach(numString => {
            if ([2,3,4,7].includes(numString.length)) {
                easyNumbers++;
            }

            total++;
        })
    })
    console.log('easy', easyNumbers);
    console.log('total', total);
}

process();