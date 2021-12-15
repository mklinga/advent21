const fs = require('fs');

function getInput() { 
    return new Promise((resolve, reject) => {
        fs.readFile('./input1', {}, (err, data) => {
            if (err) {
                return reject(err);
            }

            resolve(data.toString().split('\n').map(line => line.trim()));
        });
    });
}

const ITERATIONS = 5000;
const ALLOWED_VISITS = 50;

async function process() {
    const lines = await getInput();
    let INPUT_LINE_LENGTH = lines[0].length;
    const LINE_LENGTH = lines[0].length * 5;

    const mollucs = lines
        .reduce((acc, line) => acc.concat(line.split('')), [])
        .reduce((acc, danger, index) => {
            const x = index % INPUT_LINE_LENGTH;
            const y = Math.floor(index / INPUT_LINE_LENGTH);
            const dex = [x,y].join(',');
            acc[dex] = parseInt(danger);
            // Generate the rest of the map
            for (let incX = 0; incX < 5; incX++) {
                for (let incY = 0; incY < 5; incY++) {
                    if (incX === 0 && incY === 0) {
                        continue;
                    }

                    const next = [x + incX * INPUT_LINE_LENGTH, y + incY * INPUT_LINE_LENGTH].join(',');
                    const nextDanger = (incX + incY + acc[dex]);
                    acc[next] = nextDanger > 9 ? (nextDanger % 9) : nextDanger;
                }
            }

            return acc;
    }, {})

    const shortestPaths = {
        '0,0': 0
    };

    function calculateNeighbouringPaths(cursor, pathSoFar) {
        const { x, y } = cursor;
        if (y > 0) {
            const cursorIndex = `${x},${y - 1}`;
            shortestPaths[cursorIndex] = Math.min(shortestPaths[cursorIndex] || Number.POSITIVE_INFINITY, mollucs[cursorIndex] + pathSoFar);
        }
        
        if (y < LINE_LENGTH - 1) {
            const cursorIndex = `${x},${y + 1}`;
            shortestPaths[cursorIndex] = Math.min(shortestPaths[cursorIndex] || Number.POSITIVE_INFINITY, mollucs[cursorIndex] + pathSoFar);
        }

        if (x > 0) {
            const cursorIndex = `${x - 1},${y}`;
            shortestPaths[cursorIndex] = Math.min(shortestPaths[cursorIndex] || Number.POSITIVE_INFINITY, mollucs[cursorIndex] + pathSoFar);
        }

        if (x < LINE_LENGTH - 1) {
            const cursorIndex = `${x + 1},${y}`;
            shortestPaths[cursorIndex] = Math.min(shortestPaths[cursorIndex] || Number.POSITIVE_INFINITY, mollucs[cursorIndex] + pathSoFar);
        }
    }
    
    function sprawl(cursors) {
        cursors.forEach(cursor => {
            const { x, y } = cursor;
            calculateNeighbouringPaths({ x, y }, shortestPaths[`${x},${y}`] || 0);
        });
    }

    let iterations = 0;
    let cursors = [{ x: 0, y: 0 }];

    const cursorVisits = {}
    let shortestSoFar = Number.POSITIVE_INFINITY;
    const key = (LINE_LENGTH - 1) + ',' + (LINE_LENGTH - 1);
    while (iterations < ITERATIONS && cursors.length > 0) {
        iterations++;
        if (iterations % 100 === 0)
            console.log('iteration', iterations, Object.keys(shortestPaths).length, cursors.length)
        
        if (shortestPaths[key]) {
            shortestSoFar = Math.min(shortestSoFar, shortestPaths[key])
        }

        sprawl(cursors);

        let nextCursors = new Set();
        cursors.forEach(({ x, y}) => {
            if (y > 0) {
                nextCursors.add(`${x},${y - 1}`)
            }
            
            if (y < LINE_LENGTH - 1) {
                nextCursors.add(`${x},${y + 1}`)
            }

            if (x > 0) {
                nextCursors.add(`${x - 1},${y}`)
            }

            if (x < LINE_LENGTH - 1) {
                nextCursors.add(`${x + 1},${y}`)
            }
        });

        cursors = [];
        nextCursors.forEach(cursor => {
            const [ x, y ] = cursor.split(',').map(x => parseInt(x));
            cursorVisits[cursor] = (cursorVisits[cursor] || 0) + 1;
            if (cursorVisits[cursor] < ALLOWED_VISITS) {
                cursors.push({ x, y });
            }
        })

    }
    console.log('Best guess after', iterations, 'iterations', shortestSoFar);
}

process();