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

let hits = new Set();
for (let v0X = 0; v0X <= TARGET_X2; v0X++) {
    for (let v0Y = -200; v0Y < 500; v0Y++) {
        let hasGonePast = false;
        let posX = 0;
        let posY = 0;
        let step = 0;

        while (!hasGonePast) {
            if ((posX >= TARGET_X1 && posX <= TARGET_X2) && (posY <= TARGET_Y2 && posY >= TARGET_Y1)) {
                hits.add(v0X + ',' + v0Y);
                break;
            }
            
            if (posX > TARGET_X2 || posY < TARGET_Y1) {
                hasGonePast = true;
            }
            
            posX += velocityX(step, v0X);
            posY += velocityY(step, v0Y);
            step++;
        }
    }
}

console.log('Hits to the target:', hits.size)