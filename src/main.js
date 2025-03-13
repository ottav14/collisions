import './style.css';
import * as LA from './la.js';
import { hue, clamp } from './util.js';
import { Point } from './Point.js';

let canvasWidth = 500;
let canvasHeight = 500;
const circleCount = 5;
const eulerIterations = 1;
const spawnAttempts = 500;
const circleSizeFactor = 30;
const mass = 1;
const g = 0.0;
const drag = 0.05;
const maxVelocity = 10;
const initialVelocity = maxVelocity;
const energyLoss = 0.05;
const backgroundColor = '#000'
const friction = 0.02;
const timestep = 0.02;
const debug = true;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const createCircles = () => {
	const newCircles = [];
	for(let i=0; i<circleCount; i++) {
		const radius = mass * circleSizeFactor;

		const cpr = 10;
		const position = new Point(
			(i%cpr)*3*radius + 3*radius,
			Math.floor(i/cpr)*radius*3 + 3*radius
		);

		const velocity = new Point(
			Math.floor(Math.random()*initialVelocity),
			Math.floor(Math.random()*initialVelocity)
		)

		newCircles.push({
			pos: position,
			vel: velocity,
			m: mass,
			r: Math.sqrt(mass) * circleSizeFactor
		});
	}
	return newCircles;
}
const circles = createCircles();


const energyDisplay = document.getElementById('energy');
let energy = 0;
const updateEnergyDisplay = () => {
	let totalEnergy = 0;
	for(const c of circles) {
		const v = LA.magnitude(c.vel);
		totalEnergy += 0.5 * mass * v * v;
	}
	energyDisplay.textContent = `Energy: ${totalEnergy}`;
}



const drawCircle = (c) => {
	ctx.beginPath();
	ctx.fillStyle = '#00f';
	ctx.arc(c.pos.x, c.pos.y, c.r, 0, Math.PI * 2); 
	ctx.fill();
}

const drawLine = (x1, y1, x2, y2) => {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

const step = (c, t) => {
	c.vel.y += t*t*g;
	c.pos = LA.add(c.pos, LA.mult(t, c.vel));
}

const undoStep = (c, t) => {
	c.vel.y -= t*t*g;
	c.pos = LA.sub(c.pos, LA.mult(t, c.vel));
}

const handleCollision = (c1, c2) => {

	const v1 = c1.vel;
	const v2 = c2.vel;
	const n = LA.normalize(LA.sub(v2, v1));
	const t = new Point(n.y, -n.x);
	
	const vn1 = LA.dot(v1, n);
	const vt1 = LA.dot(v1, t);
	const vn2 = LA.dot(v2, n);
	const vt2 = LA.dot(v2, t);

	const v1d = (1-energyLoss) * ((c1.m-c2.m) * vn1 + 2*c2.m*vn2) / (c1.m+c2.m);
	const v2d = (1-energyLoss) * ((c2.m-c1.m) * vn2 + 2*c1.m*vn1) / (c1.m+c2.m);

	c1.vel = LA.add(LA.mult(v1d, n), LA.mult(vt1, t));
	c2.vel = LA.add(LA.mult(v2d, n), LA.mult(vt2, t));

}

const checkCollisions = (i, t) => {

	const c1 = circles[i];
	const s = 1/eulerIterations;
	for(let j=0; j<circles.length; j++) {
		const c2 = circles[j];
		if(i !== j && LA.distance(c1.pos, c2.pos) < c1.r+c2.r) {
			undoStep(c1, s);
			undoStep(c2, s);
			handleCollision(c1, c2);
			step(c1, s);
			step(c2, s);
		}
	}

	if(c1.pos.x + c1.r > canvasWidth) {
		c1.pos.x = canvasWidth - c1.r;
		c1.vel.x *= -1+friction;
		step(c1, s);
	}
	if(c1.pos.x - c1.r < 0) {
		c1.pos.x = c1.r;
		c1.vel.x *= -1+friction;
		step(c1, s);
	}
	if(c1.pos.y + c1.r > canvasHeight) {
		c1.pos.y = canvasHeight - c1.r;
		c1.vel.y *= -1+friction;
		step(c1, s);
	}
	if(c1.pos.y - c1.r < 0) {
		c1.pos.y = c1.r;
		c1.vel.y *= -1+friction;
		step(c1, s);
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
			const n = LA.normalize(c.vel);
			const t = new Point(n.y, -n.x);
			const factor = 20;
			const speed = LA.magnitude(c.vel);
			ctx.strokeStyle = '#00f';
			drawLine(c.pos.x, c.pos.y, c.pos.x + factor * speed * n.x, c.pos.y + factor * speed * n.y);
			ctx.strokeStyle = '#f00';
			drawLine(c.pos.x, c.pos.y, c.pos.x + factor * 3 * t.x, c.pos.y + factor * 3 * t.y);

		}
	}
	
	
}

const interval = setInterval(() => {
	
	for(let i=0; i<circles.length; i++) {

		const c = circles[i];

		
		for(let t=0; t<eulerIterations; t++) {
			step(c, 1/eulerIterations);
			checkCollisions(i);
		}

	}

	updateEnergyDisplay();


	drawLoop();
}, 1000*timestep);


