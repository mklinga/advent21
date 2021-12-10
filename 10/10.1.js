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

const isOpening = char => ['(', '{', '[', '<'].includes(char);
const isClosing = char => [')', '}', ']', '>'].includes(char);

const getErrorPoints = char => {
    switch (char) {
        case ')': return 3;
        case ']': return 57;
        case '}': return 1197;
        case '>': return 25137;
        default:
            throw new Error('Invalid char');
    }
}

async function process() {
    const data = await getInput();

    const errorPoints = data.map(line => {
        const opened = [];
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (isOpening(char)) {
                opened.push(char);
            } else if (isClosing(char)) {
                const last = opened[opened.length - 1];
                if ((char === ')' && last !== '(') || (char === '>' && last !== '<') || (char === ']' && last !== '[') || (char === '}' && last !== '{')) {
                    return getErrorPoints(char);
                }
                
                opened.pop();
            }
        }
    }).filter(x => x).reduce((acc, x) => acc + x, 0);

    console.log('Error points:', errorPoints);
}

process();