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

class Line {
    x1;
    y1;
    x2;
    y2;
    
    constructor(x1, y1, x2, y2) {
        this.x1 = parseInt(x1);
        this.x2 = parseInt(x2);
        this.y1 = parseInt(y1);
        this.y2 = parseInt(y2);
    }

    isHorizontalOrVertical() {
        return this.x1 === this.x2 || this.y1 === this.y2;
    }

    getAllPoints() {
        const points = [[this.x1, this.y1]];
        const deltaX = this.x1 === this.x2 ? 0 : (this.x1 < this.x2 ? 1 : -1);
        const deltaY = this.y1 === this.y2 ? 0 : (this.y1 < this.y2 ? 1 : -1);

        let x = this.x1;
        let y = this.y1;
        while (x !== this.x2 || y !== this.y2) {
            x += deltaX;
            y += deltaY;
            points.push([x, y]);
        }
        return points;
    }

    toString() {
        return `line: ${this.x1},${this.y1} -> ${this.x2},${this.y2}`;
    }
}

function parseLine(str) {
    const [_, x1, y1, x2, y2] = str.trim().match(/(\d+),(\d+) -> (\d+),(\d+)/);
    return new Line(x1, y1, x2, y2);
}


async function process() {
    const input = await getInput();
    if (!Array.isArray(input)) {
        throw new Error('Input is not an array!')
    }

    const pointTable = {};
    for (let i = 0; i < input.length; i++) {
        const line = parseLine(input[i]);
        /* FOR first puzzle */
        // if (!line.isHorizontalOrVertical()) {
        //     continue;
        // }
        const points = line.getAllPoints();
        points.forEach(([x, y]) => {
            pointTable[`${x}->${y}`] = (pointTable[`${x}->${y}`] || 0) + 1;
        })
    }

    const overlapping = Object.entries(pointTable).filter(([_, x]) => x > 1);
    console.log(overlapping.length)
}

process();