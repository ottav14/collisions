import './style.css';
import * as LA from './la.js';
import { hue, clamp } from './util.js';

const canvasWidth = 1000;
const canvasHeight = 800;
const circleCount = 80;
const eulerIterations = 4;
const spawnAttempts = 500;
const circleSizeFactor = 30;
const mass = 1;
const g = 0.0;
const drag = 0.05;
const maxVelocity = 9;
const initialVelocity = 9;
const energyLoss = 0.3;
const backgroundColor = '#000'
const friction = 0.00;
const timestep = 0.02;
const debug = false;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
canvas.width = canvasWidth;
canvas.height = canvasHeight;


const createCircles = () => {
	const newCircles = [];
	for(let i=0; i<circleCount; i++) {
		const radius = mass * circleSizeFactor;

		const cpr = 10;
		const position = {
			x: (i%cpr)*3*radius + 3*radius,
			y: Math.floor(i/cpr)*radius*3 + 3*radius
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
		const v = LA.magnitude({
			x: c.vx,
			y: c.vy,
		});
		totalEnergy += 0.5 * mass * v * v;
	}
	energyDisplay.textContent = `Energy: ${totalEnergy}`;
}



const drawCircle = (c) => {
	ctx.beginPath();
	ctx.fillStyle = '#00f';
	ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); 
	ctx.fill();
}

const drawLine = (x1, y1, x2, y2) => {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

const step = (c, t) => {
	c.vy += t*t*g;
	c.x += t*c.vx;
	c.y += t*c.vy;
}

const undoStep = (c, t) => {
	c.vy -= t*t*g;
	c.x -= t*c.vx;
	c.y -= t*c.vy;
}

const handleCollision2 = (c1, c2) => {

	const v1 = { x: c1.vx, y: c1.vy };
	const v2 = { x: c2.vx, y: c2.vy };
	const n = LA.normalize(LA.sub(v2, v1));
	const t = { x: n.y, y: -n.x };
	
	const vn1 = LA.dot(v1, n);
	const vt1 = LA.dot(v1, t);
	const vn2 = LA.dot(v2, n);
	const vt2 = LA.dot(v2, t);

	const v1d = ((c1.m-c2.m) * vn1 + 2*c2.m*vn2) / (c1.m+c2.m);
	const v2d = ((c2.m-c1.m) * vn2 + 2*c1.m*vn1) / (c1.m+c2.m);

	c1.vx = v1d * n.x + vt1 * t.x;
	c1.vy = v1d * n.y + vt1 * t.y;
	c2.vx = v2d * n.x + vt2 * t.x;
	c2.vy = v2d * n.y + vt2 * t.y;

}

const checkCollisions = (i, t) => {

	const c1 = circles[i];
	const s = 1/eulerIterations;
	for(let j=0; j<circles.length; j++) {
		const c2 = circles[j];
		if(i !== j && LA.distance(c1, c2) < c1.r+c2.r) {
			undoStep(c1, s);
			undoStep(c2, s);
			handleCollision2(c1, c2);
			step(c1, s);
			step(c2, s);
		}
	}

	if(c1.x + c1.r > canvasWidth || c1.x - c1.r < 0) {
		undoStep(c1, s);
		c1.vx *= -1+friction;
		step(c1, s);
	}
	if(c1.y + c1.r > canvasHeight || c1.y - c1.r < 0) {
		undoStep(c1, s);
		c1.vy *= -1+friction;
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

