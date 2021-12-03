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

function calculateMovement (input) {
    let depth = 0;
    let horizontal = 0;
    for (let i = 0; i < input.length; i++) {
        const [_, direction, amount] = input[i].match(/(\w+)\s(\d+)/);
        switch (direction) {
            case 'forward':
                horizontal += parseInt(amount);
                break;
            case 'up':
                depth -= parseInt(amount);
                break;
            case 'down':
                depth += parseInt(amount);
                break;
            default:
        }
    }

    return [depth, horizontal];
}

async function process() {
    const input = await getInput();
    if (!Array.isArray(input)) {
        throw new Error('Input is not an array!')
    }

    const [depth, horizontal] = calculateMovement(input);

    console.log('movement:', [depth, horizontal], ' = ', depth * horizontal);
}

process();