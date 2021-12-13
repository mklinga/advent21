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

function Instruction (axis, num) {
    this.axis = axis;
    this.num = num;
}

function parseLines(input) {
    let readingDots = true;
    const [dots, instructions] = [[], []]
    input.forEach((line, index) => {
        if (line === '') {
            readingDots = false;
            return;
        }

        if (readingDots) {
            const [ _, x, y ] = line.match(/^(\d+),(\d+)$/);
            dots.push({ x: parseInt(x), y: parseInt(y) });
        } else {
            // fold along y=6
            const [ _, axis, num ] = line.match(/^fold along (.)=(\d+)$/);
            instructions.push(new Instruction(axis, num));
        }
    })

    return [dots, instructions];
}

function fold(dots, instruction) {
    const { axis, num } = instruction;
    console.log('folding along', axis, 'for', num)

    const dotMap = dots.reduce((acc, dot) => {
        const distance = dot[axis] - num;
        const axisValue = (distance > 0) ? (dot[axis] - distance * 2) : dot[axis];
        const key = axis === 'x' ? `${axisValue},${dot.y}` : `${dot.x},${axisValue}`;
        return { ...acc, [key]: true };
    }, {});

    return Object.keys(dotMap).map(key => {
        const [x, y] = key.split(',');
        return { x: parseInt(x), y: parseInt(y) };
    });
}

async function process() {
    const [dots, instructions] = parseLines(await getInput())
    console.log('visible dots at start:', Object.keys(dots).length);

    let nextDots = [...dots];
    instructions.forEach(instruction => {
        nextDots = fold(nextDots, instruction);
        console.log('visible dots:', nextDots.length)
    });
}

process();