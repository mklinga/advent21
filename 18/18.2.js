const fs = require('fs');

function getInput() { 
    return new Promise((resolve, reject) => {
        fs.readFile('./input1', {}, (err, data) => {
            resolve(data.toString().split('\n').map(line => line.trim()));
        });
    });
}

class Snumber {
    parent = null;
    left = null;
    right = null;
    value = null;

    constructor(parent, left, right) {
        this.parent = parent;
        if (right === undefined) {
            this.value = left;
        } else {
            this.left = left;
            this.right = right;
        }
    }

    static parse(str) {
        const arr = JSON.parse(str);

        function readPair(parent, pair) {
            const node = new Snumber(parent, null, null);
            node.left = Array.isArray(pair[0]) ? readPair(node, pair[0]) : new Snumber(node, pair[0]);
            node.right = Array.isArray(pair[1]) ? readPair(node, pair[1]) : new Snumber(node, pair[1]);
            return node;
        }

        return readPair(null, arr);
    }

    static sum(s1, s2) {
        const commonParent = new Snumber(null, null, null);
        s1.parent = commonParent;
        s2.parent = commonParent;
        commonParent.left = s1;
        commonParent.right = s2;
        return commonParent;
    }

    hasChildren() {
        return this.value === null;
    }

    explode() {
        // First find explodes - pairs that are four levels deep
        let exploding = null;
        function seek(node, depth) {
            if (exploding !== null) {
                return;
            }
            if (depth === 4 && node.hasChildren()) {
                exploding = { node, addToLeft: node.left.value, addToRight: node.right.value };
                const left = node.left.value;
                const right = node.right.value;
            }

            if (node.hasChildren()) {
                const left = seek(node.left, depth + 1);
                const right = seek(node.right, depth + 1);
            }
        }

        const result = seek(this, 0);

        function findNextTo(node, direction) {
            const opposite = direction === 'left' ? 'right' : 'left';
            const parent = node.parent;
            if (parent === null) {
                return;
            }

            if (parent[direction] !== node) {
                function takeValueFrom(node, dir) {
                    if (node.hasChildren()) {
                        return takeValueFrom(node[dir], dir);
                    } else {
                        return node;
                    }
                }
                return takeValueFrom(parent[direction], opposite);
            } else {
                return findNextTo(parent, direction);
            }
        }

        if (exploding) {
            exploding.node.value = 0;
            exploding.node.left = null;
            exploding.node.right = null;
            const right = findNextTo(exploding.node, 'right')
            const left = findNextTo(exploding.node, 'left')
            if (right) {
                right.value += exploding.addToRight;
            }
            if (left) {
                left.value += exploding.addToLeft;
            }
        }

        return { hasExploded: !!exploding, node: this };
    }

    split() {
        let splitting = null;
        function seek(node) {
            if (splitting !== null) {
                return;
            }

            if (node.hasChildren()) {
                seek(node.left);
                seek(node.right);
            } else if (node.value >= 10) {
                splitting = node;
            }
        }

        seek(this);
        if (splitting) {
            const [left, right] = [Math.floor(splitting.value / 2), Math.ceil(splitting.value / 2)];
            splitting.value = null;
            splitting.left = new Snumber(splitting, left)
            splitting.right = new Snumber(splitting, right)
        }
        return { hasSplit: !!splitting, node: this };
    }

    reduce() {
        let hasExploded = false;
        let hasSplit = false;
        do {
            hasExploded = this.explode().hasExploded;
            if (!hasExploded) {
                hasSplit = this.split().hasSplit;
            }
        } while (hasExploded || hasSplit);
        return this;
    }

    calculateMagnitude() {
        // magnitude === 3*left + 2*right
        const magnitude = 0;

        function count(node) {
            if (node.hasChildren()) {
                return 3 * count(node.left) + 2 * count(node.right);
            }
            
            return node.value;
        }

        return count(this);
    }

    static solve(assignment) {
        let result = Snumber.parse(assignment[0]);
        for (let i = 1; i < assignment.length; i++) {
            result = Snumber.sum(result, Snumber.parse(assignment[i])).reduce();
        }
        return result;
    }

    toStr() {
        let str = ''
        function parseRec(path) {
            if (path.hasChildren()) {
                const l = path.left.value !== null ? path.left.value : parseRec(path.left);
                const r = path.right.value !== null ? path.right.value : parseRec(path.right);

                return `[${l},${r}]`;
            } else return path.value;
        }

        return parseRec(this);
    }

    print() {
        console.log(this.toStr());
    }
}

async function process() {
    const input = await getInput();

    const allThePairs = [];
    for (let i = 0; i < input.length; i++) {
        for (let j = 0; j < input.length; j++) {
            if (i === j) continue;
            allThePairs.push([input[i], input[j]]);
            allThePairs.push([input[j], input[i]]);
        }
    }

    let mightiestMagnitude = 0;
    console.log('Calculating for', allThePairs.length, 'items');
    allThePairs.forEach(pair => {
        const result = Snumber.sum(Snumber.parse(pair[0]), Snumber.parse(pair[1])).reduce();
        mightiestMagnitude = Math.max(result.calculateMagnitude(), mightiestMagnitude);
    })
    console.log('The mightiest of them all:', mightiestMagnitude);
}

process();