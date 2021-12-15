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

async function process() {
    const lines = await getInput();
    const LINE_LENGTH = lines[0].length;

    const mollucs = lines
        .reduce((acc, line) => acc.concat(line.split('')), [])
        .reduce((acc, danger, index) => {
            const x = index % LINE_LENGTH;
            const y = Math.floor(index / LINE_LENGTH);
            const dex = [x,y].join(',');
            acc[dex] = parseInt(danger);
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

    let s = new Set();
    while (iterations < 1000) {
        iterations++;
        // console.log('iteration', iterations, shortestPaths['99,99'])
        s.add(shortestPaths['99,99'])
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
            cursors.push({ x, y });
        })

        if (shortestPaths['99,99'] !== undefined) {
            console.log('FOUND', shortestPaths['99,99']);
            // break;
        }
    }
    console.log(s);
}

process();