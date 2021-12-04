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

function Table (size) {
    this.size = size || 5;
    this.elements = [];
}

Table.prototype.get = function(x, y) {
    return this.elements[y * this.size + x];
}

Table.prototype.addRow = function(valueList) {
    valueList.forEach(value => this.elements.push({ value, marked: false }));
}

Table.prototype.print = function() {
    let string = '';
    for (let i = 0; i < this.elements.length; i++) {
        const element = this.elements[i];
        const marker = element.marked ? '*' : ' ';
        string += (marker + element.value + marker);
        if (i % this.size === (this.size - 1)) {
            string += '\n';
        } else {
            string += ' '
        }
    }
    console.log(string);
}

Table.prototype.mark = function(value) {
    const index = this.elements.map(e => e.value).indexOf(value);
    if (index !== -1) {
        this.elements[index].marked = true;
    }

    return index;
}

Table.prototype.hasBingo = function() {
    // Horizontal rows
    for (let y = 0; y < this.size; y++) {
        let bingoInRow = true; // oh, the optimism
        for (let x = 0; x < this.size; x++) {
            bingoInRow = bingoInRow && this.get(x, y).marked;
        }
        if (bingoInRow) {
            return true;
        }
    }

    // Vertical rows
    for (let x = 0; x < this.size; x++) {
        let bingoColumn = true;
        for (let y = 0; y < this.size; y++) {
            bingoColumn = bingoColumn && this.get(x, y).marked;
        }

        if (bingoColumn) {
            return true;
        }
    }

    return false;
}

Table.prototype.getSumOfUnmarked = function() {
    return this.elements.reduce((acc, e) => acc + (e.marked ? 0 : parseInt(e.value)), 0);
}

function parseTables (input) {
    const tables = [];
    let currentTable;
    for (let i = 0; i < input.length; i++) {
        // There is an empty row before each table
        if (input[i].trim() === '') {
            currentTable = currentTable === undefined ? 0 : currentTable + 1;
            tables.push(new Table());
            continue;
        }
        
        const nums = input[i].trim().split(/\s+/);
        tables[currentTable].addRow(nums);
    }

    return tables;
}

async function process() {
    const input = await getInput();
    if (!Array.isArray(input)) {
        throw new Error('Input is not an array!')
    }

    const bingoNumbers = input[0].trim().split(',');
    input.shift();

    const tables = parseTables(input);

    tables.forEach(table => table.print());
    function findFirstBingo() {
        for (let bindex = 0; bindex < bingoNumbers.length; bindex++) {
            const number = bingoNumbers[bindex];
            console.log('guessing number', number);
            for (let tindex = 0; tindex < tables.length; tindex++) {
                const table = tables[tindex];
                table.mark(number);
                if (table.hasBingo()) {
                    console.log('BINGO! At number', tindex);
                    table.print();
                    return [tindex, number];
                }
            }
        }
    }

    const [winner, winningNumber] = findFirstBingo();
    const sumOfUnmarked = tables[winner].getSumOfUnmarked();
    console.log(winningNumber * sumOfUnmarked);
}

process();