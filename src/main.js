import './style.css';
<<<<<<< HEAD
import * as LA from './la.js';
import { hue, clamp } from './util.js';
=======
>>>>>>> feature

const canvasWidth = 800;
const canvasHeight = canvasWidth;
const circleCount = 10;
const spawnAttempts = 500;
const circleSizeFactor = 30;
<<<<<<< HEAD
const minMass = 1;
const maxMass = 5;
const g = 0.4;
const drag = 0.05;
const maxVelocity = 10;
const initialVelocity = 1;
=======
const mass = 1;
const g = 0;
const energyLoss = 0.3;
const maxVelocity = 10;
const initialVelocity = 7;
>>>>>>> feature
const backgroundColor = '#000'
const friction = 0.00;
const timestep = 0.02;
const debug = false;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
canvas.width = canvasWidth;
canvas.height = canvasHeight;

<<<<<<< HEAD
const drawCircle = (c) => {
	const v = LA.magnitude({ x: c.vx, y: c.vy });
	const h = 360 * (c.m - minMass) / (maxMass - minMass);
	if(h >= 360)
		console.log(v);
=======
const add = (v, w) => ({ x: v.x + w.x, y: v.y + w.y });
const sub = (v, w) => ({ x: v.x - w.x, y: v.y - w.y });
const mult = (c, v) => ({ x: c * v.x, y: c * v.y });
const clamp = (val, min, max) => Math.max(Math.min(val, max), min);
const distance = (p1, p2) => Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
const dot = (v, w) => (v.x * w.x + v.y * w.y);
const magnitude = (v) => Math.sqrt(v.x**2 + v.y**2);
const normalize = (v) => {
	const mag = magnitude(v);
	return {
		x: v.x / mag,
		y: v.y / mag
	}
}

const createCircles = () => {
	const newCircles = [];
	for(let i=0; i<circleCount; i++) {
		const radius = mass * circleSizeFactor;

		let position = {
			x: Math.floor((canvasWidth-2*radius)*Math.random()) + radius,
			y: Math.floor((canvasHeight-2*radius)*Math.random()) + radius,
		}
			
		for(let i=0; i<spawnAttempts; i++) {
			for(const other of newCircles) {
				if(distance(position, other) > radius+other.r)
					break;
				else {
					position = {
						x: Math.floor((canvasWidth-2*radius)*Math.random()) + radius,
						y: Math.floor((canvasHeight-2*radius)*Math.random()) + radius,
					}
				}
			}
		}

		newCircles.push({
			x: position.x,
			y: position.y,
			vx: Math.floor(Math.random()*initialVelocity),
			vy: Math.floor(Math.random()*initialVelocity),
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
		const v = magnitude({
			x: c.vx,
			y: c.vy,
		});
		totalEnergy += 0.5 * mass * v * v;
	}
	energyDisplay.textContent = `Energy: ${totalEnergy}`;
}



const drawCircle = (x, y, r) => {
>>>>>>> feature
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

<<<<<<< HEAD

=======
>>>>>>> feature
const step = (p) => {
	p.x += p.vx;
	p.y += p.vy;
}

const undoStep = (p) => {
	p.x -= p.vx;
	p.y -= p.vy;
}



<<<<<<< HEAD
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
=======
>>>>>>> feature


const handleCollision = (c1, c2) => {
	const v1 = { x: c1.vx, y: c1.vy };
	const v2 = { x: c2.vx, y: c2.vy };
<<<<<<< HEAD
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
=======
	const m1 = c1.m;
	const m2 = c2.m;
	const rv1 = sub(v1, v2);
	const rv2 = sub(v2, v1);
	const rp1 = sub(c1, c2);
	const rp2 = sub(c2, c1);
	const d = distance(c1, c2);

	const v1dm = (1-energyLoss) * -(2 * m2) / (m1 + m2) * dot(rv1, rp1) / d / d;
	const v2dm = (1-energyLoss) * -(2 * m1) / (m1 + m2) * dot(rv2, rp2) / d / d;

	const v1d = mult(v1dm, rp1);
	const v2d = mult(v2dm, rp2);
>>>>>>> feature

	c1.vx = v1d.x;
	c1.vy = v1d.y;
	c2.vx = v2d.x;
	c2.vy = v2d.y;
<<<<<<< HEAD

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
=======
}

const checkCollisions = (i) => {

	const c1 = circles[i];
	for(let j=0; j<circles.length; j++) {
		const c2 = circles[j];
		if(i !== j && distance(c1, c2) < c1.r+c2.r) {
			undoStep(c1);
			undoStep(c2);
			handleCollision(c1, c2);
			step(c1);
			step(c2);
>>>>>>> feature
		}
	}

	if(c1.x + c1.r > canvasWidth || c1.x - c1.r < 0) {
		undoStep(c1);
		c1.vx *= -1+friction;
		step(c1);
	}
	if(c1.y + c1.r > canvasHeight || c1.y - c1.r < 0) {
		undoStep(c1);
		c1.vy *= -1+friction;
		step(c1);
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
	
<<<<<<< HEAD
	for(const circle of circles) {

		circle.vx = clamp(circle.vx, -maxVelocity, maxVelocity);
		circle.vy = clamp(circle.vy, -maxVelocity, maxVelocity);

		step(circle);
=======
	for(let i=0; i<circles.length; i++) {

		const c = circles[i];
		c.vy = Math.min(maxVelocity, c.vy + g);
>>>>>>> feature

		step(c);
		checkCollisions(i);

	}

	updateEnergyDisplay();


	drawLoop();
}, 1000*timestep);


