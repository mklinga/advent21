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

function Node (value) {
    this.value = value;
    this.links = [];
}

Node.prototype.addLink = function (node) {
    this.links.push(node);
}

function parseNodes(data) {
    return data.reduce((nodes, link) => {
        const [leftValue, rightValue] = link.split('-');
        const left = nodes[leftValue] || new Node(leftValue);
        const right = nodes[rightValue] || new Node(rightValue);
        left.addLink(right);
        right.addLink(left);
        
        return { ...nodes, [leftValue]: left, [rightValue]: right };
    }, {})
}

async function process() {
    const NODES = parseNodes(await getInput())

    const r = [];
    function findPaths (from, walked) {
        if (from === 'end') {
            r.push(walked.map(w => w.value));
            return walked;
        }

        const current = NODES[from];
        const visited = walked.map(x => x.value).filter(x => x !== x.toUpperCase());
        const possibleContinuingLinks = current.links.filter(x => {
            return !visited.includes(x.value);
        })

        if (possibleContinuingLinks.length === 0) {
            return walked.concat(current);
        }

        return possibleContinuingLinks.map(link => {
            const path = walked.concat(link)
            return findPaths(link.value, path);
        });
    }

    const paths = findPaths('start', [NODES.start]);
    console.log(r.length, 'paths');
}

process();