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
    if (!Array.isArray(data)) {
        throw new Error('Input is not an array!')
    }

    const entries = data.map(row => {
        const [input, output] = row.split('|');
        return [ input.trim().split(' '), output.trim().split(' ')];
    });

    function intersect(a, b) {
        return a.split('').filter(avalue => b.split('').includes(avalue));
    }

    function hasSameElements(a, b) {
        if (a.length !== b.length) return false;

        return a.every(v => b.includes(v));
    }

    const value = entries.reduce((acc, [input, output]) => {
        const onePattern = input.find(i => i.length === 2);
        const sevenPattern = input.find(i => i.length === 3);
        const fourPattern = input.find(i => i.length === 4);
        const eightPattern = input.find(i => i.length === 7);
        const ninePattern = input.find(i => i.length === 6 && intersect(i, fourPattern).length === 4);
        const zeroPattern = input.find(i => i.length === 6 && intersect(i, onePattern).length === 2 && i !== ninePattern);
        const sixPattern = input.find(i => i.length === 6 && i !== ninePattern && i !== zeroPattern);
        const threePattern = input.find(i => i.length === 5 && intersect(i, onePattern).length === 2);
        const twoPattern = input.find(i => i.length === 5 && intersect(i, ninePattern).length === 4);
        const fivePattern = input.find(i => i.length === 5 && i !== threePattern && i !== twoPattern);

        const patterns = [zeroPattern, onePattern, twoPattern, threePattern, fourPattern, fivePattern, sixPattern, sevenPattern, eightPattern, ninePattern];
        
        return acc + parseInt(output.map(o => patterns.findIndex(p => hasSameElements(p.split(''), o))).join(''));
    }, 0)

    console.log('total', value);
}

process();