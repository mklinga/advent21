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
    const input = await getInput();
    if (!Array.isArray(input)) {
        throw new Error('Input is not an array!')
    }

    const fish = input[0].split(',').reduce((acc, num) => {
        return { ...acc, [num]: (acc[num] || 0) + 1 }
    }, {});

    const DAYS = 256; // 80 for the puzzle #1

    for (let day = 0; day < DAYS; day++) {
        let newFish = fish[0] || 0;
        for (let daysToSpawn = 1; daysToSpawn <= 8; daysToSpawn++) {
            fish[daysToSpawn - 1] = fish[daysToSpawn] || 0;
        }

        fish[6] = (fish[6] || 0) + newFish;
        fish[8] = newFish;
    }

    console.log('day', DAYS, fish);
    console.log('total', Object.values(fish).reduce((acc, v) => acc + v, 0));
}

process();