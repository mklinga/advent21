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

// Converts hex char into four digit binary
function hexToBin (hex) {
    return parseInt(hex, 16).toString(2).padStart(4, '0');
}

function skip (str, amount) {
    return str.substring(amount);
}

async function process() {
    const input = (await getInput())[0];
    let read = 0;
    let representation = '';
    
    function readBits (amount, raw = false) {
        while (representation.length < amount) {
            if (input.length <= read) {
                console.error('Reached the end')
                break;
            }
            representation += hexToBin(input[read]);
            read++;
        }
        const bits = representation.substring(0, amount);
        // We can only read once, remove read bits
        representation = skip(representation, amount);
        return raw ? bits : parseInt(bits, 2);
    }


    function readLiteralData() {
        let bitsParsed = 0;
        let hasMore = true;
        let value = '';
        while (hasMore) {
            hasMore = !!readBits(1);
            value += readBits(4, true);
            bitsParsed += 5;
        }

        return { bitsParsed, value: parseInt(value, 2) };
    }

    function readNextHeader() {
        let packageLength = { packages: Number.POSITIVE_INFINITY, bits: Number.POSITIVE_INFINITY };

        // First three bits indicate the version number
        const version = readBits(3);
        let headerLength = 3;

        // Next three bits indicate the packet ID
        const packageTypeId = readBits(3)
        headerLength += 3;

        if (packageTypeId === 4) {
            return { version, packageTypeId, lengthTypeId: null, packageLength, headerLength };
        }

        const lengthTypeId = readBits(1);
        headerLength++;

        if (lengthTypeId === 0) {
            packageLength.bits = readBits(15);
            headerLength += 15;
        } else if (lengthTypeId === 1) {
            packageLength.packages = readBits(11);
            headerLength += 11;
        }

        return { version, packageTypeId, lengthTypeId, packageLength, headerLength };
    }

    function handleValues(typeId, values) {
        switch (typeId) {
            case 0:
                return values.reduce((acc, x) => acc + parseInt(x), 0);
            case 1:
                return values.reduce((acc, x) => acc * parseInt(x), 1);
            case 2:
                return values.reduce((acc, x) => Math.min(acc, parseInt(x)), parseInt(values[0]));
            case 3:
                return values.reduce((acc, x) => Math.max(acc, parseInt(x)), parseInt(values[0]));
            case 5:
                return parseInt(values[0]) > parseInt(values[1]) ? 1 : 0;
            case 6:
                return parseInt(values[0]) < parseInt(values[1]) ? 1 : 0;
            case 7:
                return parseInt(values[0]) === parseInt(values[1]) ? 1 : 0;
            default:
                throw new Error('invalid typeid ' + typeId)
        }
    }

    function readPackages(packageLength) {
        let packagesParsed = 0;
        let bitsParsed = 0;
        let packageValues = [];
        while (packagesParsed < packageLength.packages && bitsParsed < packageLength.bits) {
            const header = readNextHeader();
            bitsParsed += header.headerLength;
            
            if (header.packageTypeId === 4) {
               const { bitsParsed: bits, value } = readLiteralData();
               bitsParsed += bits;
               packageValues.push(value);
            } else {
                const { bitsParsed: bits, packageValues: values } = readPackages(header.packageLength)
                bitsParsed += bits;
                packageValues.push(handleValues(header.packageTypeId, values));
            }

            packagesParsed++;
        }
        return { bitsParsed, packageValues };
    }

    const header = readNextHeader();
    const values = readPackages(header.packageLength).packageValues;
    const result = handleValues(header.packageTypeId, values);
    console.log(result)
}

process();