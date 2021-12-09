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
    const LINE_HEIGHT = 100;
    const dataArray = data.reduce((acc, line) => {
        return acc.concat(line.trim().split('').map(x => parseInt(x)))
    }, []);

    const getNeighbours = x => {
        const hasLeft = x % LINE_LENGTH !== 0;
        const hasRight = x % LINE_LENGTH !== LINE_LENGTH - 1;
        const hasTop = x >= LINE_LENGTH;
        const hasBottom = x < LINE_HEIGHT * (LINE_LENGTH - 1);
        return {
            left: hasLeft ? { index: x - 1, point: dataArray[x - 1] } : null,
            right: hasRight ? { index: x + 1, point: dataArray[x + 1] } : null,
            top: hasTop ? { index: x - LINE_LENGTH, point: dataArray[x - LINE_LENGTH] } : null,
            bottom: hasBottom ? { index: x + LINE_LENGTH, point: dataArray[x + LINE_LENGTH] } : null
        }
    }

    function isLowPoint (point, neighbours) {
        const neighbourPoints = Object.values(neighbours).filter(x => x !== null).map(x => x.point)
        return point < Math.min.apply(null, neighbourPoints);
    }

    function getNeighbouringBasins (index, point, basinIndices) {
        let basins = 0;
        const { top, bottom, left, right } = getNeighbours(index);

        if (top !== null && top.point > point && top.point !== 9 && !basinIndices.includes(top.index)) {
            basinIndices.push(top.index);
            basins += 1 + getNeighbouringBasins(top.index, top.point, basinIndices);
        }
        if (bottom !== null && bottom.point > point && bottom.point !== 9 && !basinIndices.includes(bottom.index)) {
            basinIndices.push(bottom.index);
            basins += 1 + getNeighbouringBasins(bottom.index, bottom.point, basinIndices);
        }
        if (left !== null && left.point > point && left.point !== 9 && !basinIndices.includes(left.index)) {
            basinIndices.push(left.index);
            basins += 1 + getNeighbouringBasins(left.index, left.point, basinIndices);
        }
        if (right !== null && right.point > point && right.point !== 9 && !basinIndices.includes(right.index)) {
            basinIndices.push(right.index);
            basins += 1 + getNeighbouringBasins(right.index, right.point, basinIndices);
        }

        return basins;
    }

    let top3Basins = [];
    dataArray.forEach((point, index) => {
        const neighbours = getNeighbours(index)

        if (isLowPoint(point, neighbours)) {
            let basinIndices = [index];
            let basinSize = 1 + getNeighbouringBasins(index, point, basinIndices);
            top3Basins.push(parseInt(basinSize));
            if (top3Basins.length > 3) {
                top3Basins.sort((a, b) => a - b).shift();
            }
        }
    })
    console.log('Result:', top3Basins[0] * top3Basins[1] * top3Basins[2])
}

process();