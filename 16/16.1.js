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
    // const input = '8A004A801A8002F478'; // 16, ok
    // const input = '620080001611562C8802118E34'; // 12, ok
    // const input = 'C0015000016115A2E0802F182340'; // 23, ok
    // const input = 'A0016C880162017C3686B18A3D4780'; // 31, ok
    const input = (await getInput())[0];
    let read = 0;
    let representation = '';
    
    function readBits (amount) {
        while (representation.length < amount) {
            if (input.length <= read) {
                console.log('Reached the end')
                break;
            }
            representation += hexToBin(input[read]);
            read++;
        }
        const bits = representation.substring(0, amount);
        // We can only read once, remove read bits
        representation = skip(representation, amount);
        return parseInt(bits, 2);
    }


    function readLiteralData() {
        let bitsParsed = 0;
        let hasMore = true;
        let value = '';
        while (hasMore) {
            hasMore = !!readBits(1);
            value += readBits(4);
            bitsParsed += 5;
        }

        return bitsParsed;
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

    let versionSum = 0;
    function readPackages(packageLength) {
        let packagesParsed = 0;
        let bitsParsed = 0;
        while (packagesParsed < packageLength.packages && bitsParsed < packageLength.bits) {
            const header = readNextHeader();
            versionSum += header.version;
            bitsParsed += header.headerLength;
            
            if (header.packageTypeId === 4) {
                bitsParsed += readLiteralData();
            } else {
                bitsParsed += readPackages(header.packageLength)
            }

            packagesParsed++;
        }
        return bitsParsed;
    }

    const header = readNextHeader();
    versionSum += header.version;
    readPackages(header.packageLength);

    console.log('Version sum', versionSum)
}

process();