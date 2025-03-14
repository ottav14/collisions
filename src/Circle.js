import Point from './Point.js';
import * as LA from './la.js';
import * as PARAMS from './params.js';

const handleCollision = (c1, c2) => {

	const v1 = c1.vel;
	const v2 = c2.vel;
	const n = LA.normalize(LA.sub(v2, v1));
	const t = new Point(n.y, -n.x);
	
	const vn1 = LA.dot(v1, n);
	const vt1 = LA.dot(v1, t);
	const vn2 = LA.dot(v2, n);
	const vt2 = LA.dot(v2, t);

	const v1d = (1-PARAMS.energyLoss) * ((c1.m-c2.m) * vn1 + 2*c2.m*vn2) / (c1.m+c2.m);
	const v2d = (1-PARAMS.energyLoss) * ((c2.m-c1.m) * vn2 + 2*c1.m*vn1) / (c1.m+c2.m);

	c1.vel = LA.add(LA.mult(v1d, n), LA.mult(vt1, t));
	c2.vel = LA.add(LA.mult(v2d, n), LA.mult(vt2, t));

}



export default class Circle {

	constructor(pos, vel, r, m, col) {
		this.pos = pos;
		this.vel = vel;
		this.acc = new Point(0, 0);
		this.r = r;
		this.m = m;
		this.col = col;
	}

	step() {
		this.acc.y = Math.min(this.acc.y+PARAMS.g, PARAMS.terminalVelocity);

		this.vel = LA.add(this.vel, this.acc);
		this.pos = LA.add(this.pos, this.vel);

		this.acc = new Point(0, 0);
	}

	undoStep() {
		this.acc.y -= PARAMS.g;

		this.vel = LA.sub(this.vel, this.acc);
		this.pos = LA.sub(this.pos, this.vel);

		this.acc = new Point(0, 0);
	}

	repulse(other) {

		const d = Math.max(0.1, LA.distance(this.pos, other.pos));
		const mag = PARAMS.repulsionForce / Math.sqrt(d);
		return LA.setMag(LA.sub(this.pos, other.pos), mag);

	}

	checkCollisions(circles) {

		for(let i=0; i<circles.length; i++) {
			const other = circles[i];
			if(this !== other && LA.distance(this.pos, other.pos) < this.r+other.r) {
				handleCollision(this, other);
				const repulse = this.repulse(other);
				this.acc = LA.add(this.acc, this.repulse(other));
				this.step();
				other.step();
			}
		}

		if(this.pos.x + this.r > PARAMS.canvasWidth) {
			this.pos.x = PARAMS.canvasWidth - this.r;
			this.vel.x *= -1+PARAMS.friction;
			this.step();
		}
		if(this.pos.x - this.r < 0) {
			this.pos.x = this.r;
			this.vel.x *= -1+PARAMS.friction;
			this.step();
		}
		if(this.pos.y + this.r > PARAMS.canvasHeight) {
			this.pos.y = PARAMS.canvasHeight - this.r;
			this.vel.y *= -1+PARAMS.friction;
			this.step();
		}
		if(this.pos.y - this.r < 0) {
			this.pos.y = this.r;
			this.vel.y *= -1+PARAMS.friction;
			this.step();
		}
		 
	}

	update(circles) {
		this.step();
		this.checkCollisions(circles);
	}


}
