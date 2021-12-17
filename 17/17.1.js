// target area: x=85..145, y=-163..-108

/*
    The probe's x,y position starts at 0,0. Then, it will follow some trajectory by moving in steps.
    On each step, these changes occur in the following order:

    The probe's x position increases by its x velocity.
    The probe's y position increases by its y velocity.
    Due to drag, the probe's x velocity changes by 1 toward the value 0;
        - that is, it decreases by 1 if it is greater than 0, increases by 1 if it is less than 0, or does not change if it is already 0.
    Due to gravity, the probe's y velocity decreases by 1.

*/

const TARGET_X1 = 85;
const TARGET_X2 = 145;
const TARGET_Y1 = -163;
const TARGET_Y2 = -108;

function velocityX (t, v0) {
    return (v0 === 0) ? 0 : ((v0 < 0) ? Math.min(0, v0 + t) : Math.max(0, v0 - t));
}

function velocityY (t, v0) {
    return v0 - t;
}

function posX (t, v0) {
    let pos = 0;
    for (let i = 0; i < t; i++) {
        pos += velocityX(i, v0);
    }
    return pos;
}

let minVelX = Number.POSITIVE_INFINITY;
let maxVelX = 0;

for (let vel = 10; vel < 1000; vel++) {
    let lastPos = 0;
    let step = 1;
    let hasStalled = false;
    while (!hasStalled && lastPos <= TARGET_X2) {
        if (minVelX > lastPos && lastPos >= TARGET_X1 && lastPos <= TARGET_X2) {
            minVelX = vel;
        }

        if (maxVelX < lastPos && lastPos >= TARGET_X1 && lastPos <= TARGET_X2) {
            maxVelX = vel;
        }

        const velocity = velocityX(step, vel)
        if (velocity === 0) {
            hasStalled = true;
        } else {
            const nextPosition = lastPos + velocity;
            step++;
            lastPos = nextPosition;
        }
    }
}

// We "know" that X must be between [minVelX, maxVelX]

let highest = { y: 0, step: null, v0X: null, v0Y: null };

for (let v0X = minVelX; v0X <= maxVelX; v0X++) {
    // We need to aim as high as we can, so y needs to be >0
    for (let v0Y = 0; v0Y < 1000; v0Y++) {
        let hasGonePast = false;
        let posX = 0;
        let posY = 0;
        let highestPoint = 0;

        let step = 0;
        while (!hasGonePast) {
            step++;
            posX += velocityX(step, v0X);
            posY += velocityY(step, v0Y);
            highestPoint = Math.max(highestPoint, posY);
            const inTheTargetX = (posX >= TARGET_X1 && posX <= TARGET_X2);
            const inTheTargetY = (posY <= TARGET_Y2 && posY >= TARGET_Y1);
            if (inTheTargetX && inTheTargetY) {
                if (highestPoint > highest.y) {
                    highest = { y: highestPoint, step, v0X, v0Y };
                }
                break;
            }
            
            if (posX > TARGET_X2 || posY < TARGET_Y2) {
                hasGonePast = true;
            }
        }
    }
}

console.log(highest)