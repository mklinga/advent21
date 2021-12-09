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
    const data = await getInput();
    const LINE_LENGTH = 100;
    const dataArray = data.reduce((acc, line) => {
        return acc.concat(line.trim().split('').map(x => parseInt(x)))
    }, []);

    const getNeighbours = x => {
        const hasLeft = x % LINE_LENGTH !== 0;
        const hasRight = x % LINE_LENGTH !== LINE_LENGTH - 1;
        const hasTop = x >= LINE_LENGTH;
        const hasBottom = x < LINE_LENGTH * (LINE_LENGTH - 1);
        return {
            left: hasLeft ? dataArray[x - 1] : null,
            right: hasRight ? dataArray[x + 1] : null,
            top: hasTop ? dataArray[x - LINE_LENGTH] : null,
            bottom: hasBottom ? dataArray[x + LINE_LENGTH] : null
        }
    }

    let dangerLevel = 0;
    dataArray.forEach((point, index) => {
        const neighbours = getNeighbours(index)

        if (point < Math.min.apply(null, Object.values(neighbours).filter(x => x !== null))) {
            console.log('LOWPOINT', point, neighbours);
            dangerLevel += 1 + point;
        }
    })

    console.log('DANGER', dangerLevel);
}

process();