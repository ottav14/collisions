import './style.css';
import * as LA from './la.js';
import { hue, clamp } from './util.js';

const canvasWidth = 800;
const canvasHeight = canvasWidth;
const circleCount = 10;
const spawnAttempts = 500;
const circleSizeFactor = 30;
const minMass = 1;
const maxMass = 5;
const g = 0.4;
const drag = 0.05;
const maxVelocity = 10;
const initialVelocity = 1;
const backgroundColor = '#000'
const friction = 0.00;
const timestep = 0.02;
const debug = false;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const drawCircle = (c) => {
	const v = LA.magnitude({ x: c.vx, y: c.vy });
	const h = 360 * (c.m - minMass) / (maxMass - minMass);
	if(h >= 360)
		console.log(v);
	ctx.beginPath();
	ctx.fillStyle = hue(h);
	ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); 
	ctx.fill();
}

const drawLine = (x1, y1, x2, y2) => {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}


const step = (p) => {
	p.x += p.vx;
	p.y += p.vy;
}

const undoStep = (p) => {
	p.x -= p.vx;
	p.y -= p.vy;
}



const createCircles = () => {
	const newCircles = [];
	for(let i=0; i<circleCount; i++) {
		const mass = Math.floor((maxMass-minMass) * Math.random() + minMass);
		const radius = mass * circleSizeFactor;

		let position = {
			x: Math.floor((canvasWidth-2*radius)*Math.random()) + radius,
			y: Math.floor((canvasHeight-2*radius)*Math.random()) + radius,
		}
			
		for(let i=0; i<spawnAttempts; i++) {
			let valid = true;
			for(const other of newCircles) {
				if(LA.distance(position, other) < radius+other.r) {
					valid = false;
					position = {
						x: Math.floor((canvasWidth-2*radius)*Math.random()) + radius,
						y: Math.floor((canvasHeight-2*radius)*Math.random()) + radius,
					}
					break;
				}
			}
			if(valid)
				break;
		}

		newCircles.push({
			x: position.x,
			y: position.y,
			vx: Math.floor(Math.random()*initialVelocity) + 5,
			vy: Math.floor(Math.random()*initialVelocity) + 5,
			m: mass,
			r: Math.sqrt(mass) * circleSizeFactor
		});
	}
	console.log(newCircles);
	return newCircles;
}


const circles = createCircles();


const handleCollision = (c1, c2) => {

	if(!c1.vx || !c1.vy || !c2.vx || !c2.vy)
		return;


	const m1 = c1.m;
	const m2 = c2.m;
	const v1 = { x: c1.vx, y: c1.vy };
	const v2 = { x: c2.vx, y: c2.vy };
	const un = LA.normalize(v1);
	const ut = { x: un.y, y: -un.x };

	const v1n = LA.dot(v1, un);
	const v1t = LA.dot(v1, ut);
	const v2n = LA.dot(v2, un);
	const v2t = LA.dot(v2, ut);

	const v1nd = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
	const v2nd = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

	const v1nf = LA.multiply(v1nd, un);
	const v1tf = LA.multiply(v1t, ut);
	const v2nf = LA.multiply(v2nd, un);
	const v2tf = LA.multiply(v2t, ut);

	const v1d = LA.add(v1nf, v1tf);
	const v2d = LA.add(v2nf, v2tf);

	const val = 20;

	c1.vx = v1d.x;
	c1.vy = v1d.y;
	c2.vx = v2d.x;
	c2.vy = v2d.y;

	c1.vx = clamp(c1.vx, -maxVelocity, maxVelocity);
	c1.vy = clamp(c1.vy, -maxVelocity, maxVelocity);
	c2.vx = clamp(c2.vx, -maxVelocity, maxVelocity);
	c2.vy = clamp(c2.vy, -maxVelocity, maxVelocity);

}

const checkCollisions = () => {
	for(let i=0; i<circles.length; i++) {
		for(let j=0; j<circles.length; j++) {
			const c1 = circles[i];
			const c2 = circles[j];
			if(i !== j && LA.distance(c1, c2) < c1.r+c2.r) {
				undoStep(c1);
				undoStep(c2);
				handleCollision(c1, c2);
				step(c1);
				step(c2);
			}
		}
	}
}

const drawLoop = () => {
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	for(const c of circles)
		drawCircle(c);

	// Debug
	
	if(debug) {
		for(const c of circles) {
			const n = LA.normalize({ x: c.vx, y: c.vy });
			const t = { x: n.y, y: -n.x };
			const factor = 20;
			const speed = LA.magnitude({ x: c.vx, y: c.vy });
			ctx.strokeStyle = '#00f';
			drawLine(c.x, c.y, c.x + factor * speed * n.x, c.y + factor * speed * n.y);
			ctx.strokeStyle = '#f00';
			drawLine(c.x, c.y, c.x + factor * 3 * t.x, c.y + factor * 3 * t.y);

		}
	}
	
	
}

const interval = setInterval(() => {
	
	for(const circle of circles) {

		circle.vx = clamp(circle.vx, -maxVelocity, maxVelocity);
		circle.vy = clamp(circle.vy, -maxVelocity, maxVelocity);

		step(circle);

		if(circle.x + circle.r > canvasWidth || circle.x - circle.r < 0) {
			undoStep(circle);
			circle.vx *= -1+friction;
			step(circle);
		}
		if(circle.y + circle.r > canvasHeight || circle.y - circle.r < 0) {
			undoStep(circle);
			circle.vy *= -1+friction;
			step(circle);
		}

		checkCollisions();

	}

	drawLoop();
}, 1000*timestep);


