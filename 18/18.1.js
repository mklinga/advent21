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
    function testExplodes() {
        const inputs = [
            '[[[[[9,8],1],2],3],4]',
            '[7,[6,[5,[4,[3,2]]]]]',
            '[[6,[5,[4,[3,2]]]],1]',
            '[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]',
            '[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]',
        ]
        const expectedOutputs = [
            '[[[[0,9],2],3],4]',
            '[7,[6,[5,[7,0]]]]',
            '[[6,[5,[7,0]]],3]',
            '[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]',
            '[[3,[2,[8,0]]],[9,[5,[7,0]]]]'
        ]

        inputs.forEach((input, index) => {
            let result = Snumber.parse(input).explode().node.toStr();
            if (result !== expectedOutputs[index]) {
                console.log('Input:', input)
                console.log('Output:          ', result)
                console.log('Expected output: ', expectedOutputs[index])
                throw new Error('Bad exploding result');
            }
        })

        console.log('Explode test: OK')
    }

    function testReduces() {
        const inputs = [
            '[[[[[4,3],4],4],[7,[[8,4],9]]],[1,1]]',
        ]

        const expectedOutputs = [
            '[[[[0,7],4],[[7,8],[6,0]]],[8,1]]'
        ]
        
        inputs.forEach((input, index) => {
            let result = Snumber.parse(input).reduce().toStr();
            if (result !== expectedOutputs[index]) {
                console.log('Input:           ', input)
                console.log('Output:          ', result)
                console.log('Expected output: ', expectedOutputs[index])
                throw new Error('Bad reducing result');
            }
        })

        console.log('Reducing test: OK')
    }


    function testSums() {
        const inputs = [
            [ Snumber.parse('[1,1]'), Snumber.parse('[2,2]'), Snumber.parse('[3,3]'), Snumber.parse('[4,4]') ],
            [ Snumber.parse('[1,1]'), Snumber.parse('[2,2]'), Snumber.parse('[3,3]'), Snumber.parse('[4,4]'), Snumber.parse('[5,5]') ],
            [ Snumber.parse('[1,1]'), Snumber.parse('[2,2]'), Snumber.parse('[3,3]'), Snumber.parse('[4,4]'), Snumber.parse('[5,5]'), Snumber.parse('[6,6]') ],
            [
                Snumber.parse('[[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]'),
                Snumber.parse('[7,[[[3,7],[4,3]],[[6,3],[8,8]]]]'),
                Snumber.parse('[[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]]'),
                Snumber.parse('[[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]]'),
                Snumber.parse('[7,[5,[[3,8],[1,4]]]]'),
                Snumber.parse('[[2,[2,2]],[8,[8,1]]]'),
                Snumber.parse('[2,9]'),
                Snumber.parse('[1,[[[9,3],9],[[9,0],[0,7]]]]'),
                Snumber.parse('[[[5,[7,4]],7],1]'),
                Snumber.parse('[[[[4,2],2],6],[8,7]]')
            ]
        ];

        const expectedOutputs = [
            '[[[[1,1],[2,2]],[3,3]],[4,4]]',
            '[[[[3,0],[5,3]],[4,4]],[5,5]]',
            '[[[[5,0],[7,4]],[5,5]],[6,6]]',
            '[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]'
        ]
        
        inputs.forEach((input, index) => {
            let result = input[0];
            for (let i = 1; i < input.length; i++) {
                result = Snumber.sum(result, input[i]).reduce();
            }

            result = result.toStr();
            if (result !== expectedOutputs[index]) {
                console.log('Input:           ', input)
                console.log('Output:          ', result)
                console.log('Expected output: ', expectedOutputs[index])
                throw new Error('Bad summing result');
            }
        })

        console.log('Summing test: OK')
    }
 
    function testMagnitudes() {
        const inputs = [
            '[[9,1],[1,9]]',
            '[[1,2],[[3,4],5]]',
            '[[[[0,7],4],[[7,8],[6,0]]],[8,1]]',
            '[[[[1,1],[2,2]],[3,3]],[4,4]]',
            '[[[[3,0],[5,3]],[4,4]],[5,5]]',
            '[[[[5,0],[7,4]],[5,5]],[6,6]]',
            '[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]'
        ]

        const expectedOutputs = [
            129,
            143,
            1384,
            445,
            791,
            1137,
            3488
        ]
        
        inputs.forEach((input, index) => {
            let result = Snumber.parse(input).reduce().calculateMagnitude();
            if (result !== expectedOutputs[index]) {
                console.log('Input:           ', input)
                console.log('Output:          ', result)
                console.log('Expected output: ', expectedOutputs[index])
                throw new Error('Bad magnituding result');
            }
        })

        console.log('Magnitude test: OK')
    }   

    function testAssignment() {
        const assignment = [
            '[[[0, [5, 8]], [[1, 7], [9, 6]]], [[4, [1, 2]], [[1, 4], 2]]]',
            '[[[5, [2, 8]], 4], [5, [[9, 9], 0]]]',
            '[6, [[[6, 2], [5, 6]], [[7, 6], [4, 7]]]]',
            '[[[6, [0, 7]], [0, 9]], [4, [9, [9, 0]]]]',
            '[[[7, [6, 4]], [3, [1, 3]]], [[[5, 5], 1], 9]]',
            '[[6, [[7, 3], [3, 2]]], [[[3, 8], [5, 7]], 4]]',
            '[[[[5, 4], [7, 7]], 8], [[8, 3], 8]]',
            '[[9, 3], [[9, 9], [6, [4, 9]]]]',
            '[[2, [[7, 7], 7]], [[5, 8], [[9, 3], [0, 2]]]]',
            '[[[[5, 2], 5], [8, [3, 7]]], [[5, [7, 5]], [4, 4]]]'
        ];

        let result = Snumber.solve(assignment);
        if (result.toStr() !== '[[[[6,6],[7,6]],[[7,7],[7,0]]],[[[7,7],[7,7]],[[7,8],[9,9]]]]') {
            throw new Error('bad');
        }
        
        if (result.calculateMagnitude() !== 4140) {
            throw new Error('bad magni');
        }

        console.log('Assignment test: OK');
    }

    testExplodes();
    testReduces();
    testSums();
    testMagnitudes();
    testAssignment();


    const input = await getInput();
    const result = Snumber.solve(input);
    console.log(result.calculateMagnitude());
}

process();