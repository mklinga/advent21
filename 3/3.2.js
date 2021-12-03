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

function splitListByBit(list, bitIndex) {
    let listA = [];
    let listB = []

    for (let i = 0; i < list.length; i++) {
        if (list[i][bitIndex] === '0') {
            listA.push(list[i]);
        } else {
            listB.push(list[i]);
        }
    }

    return [listA, listB]
}

function findItem(input, selectWinner) {
    let nextList = [...input];
    for (let i = 0; i < input.length; i++) {
        const [listA, listB] = splitListByBit(nextList, i);
        const winner = selectWinner(listA, listB);

        if (winner.length === 1) {
            return winner[0];
        }

        nextList = [...winner];
    }
}

function calculate (input) {
    const oxygen = findItem(input, (listA, listB) => listA.length > listB.length ? listA : listB);
    const co2 = findItem(input, (listA, listB) => listA.length > listB.length ? listB : listA);
    console.log(parseInt(oxygen, 2));
    console.log(parseInt(co2, 2));

    console.log('result', parseInt(oxygen, 2) * parseInt(co2, 2));
}

async function process() {
    const input = await getInput();
    if (!Array.isArray(input)) {
        throw new Error('Input is not an array!')
    }

    calculate(input);
}

process();
