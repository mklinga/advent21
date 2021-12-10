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

function calculateErrorPoints(open) {
    let points = 0;
    const pointsPerChar = { '(': 1, '[': 2, '{': 3, '<': 4 };
    for (let i = open.length - 1; i >= 0; i--) {
        points = (points * 5) + pointsPerChar[open[i]];
    }
    return points;
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
                // check that it matches the last opening
                const last = opened[opened.length - 1];
                if ((char === ')' && last !== '(') || (char === '>' && last !== '<') || (char === ']' && last !== '[') || (char === '}' && last !== '{')) {
                    return; // Corrupt line, ignore these for this exercise
                }

                opened.pop();
            }

            // Incomplete, last char and there's still open brackets
            if (i === line.length - 1 && opened.length > 0) {
                return calculateErrorPoints(opened);
            }
        }
    }).filter(x => x);

    console.log('Result:', errorPoints.sort((a, b) => a - b)[Math.floor(errorPoints.length / 2)]);
}

process();