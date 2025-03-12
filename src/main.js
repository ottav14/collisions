import './style.css';
import * as LA from './la.js';
import { hue, clamp } from './util.js';

const canvasWidth = 800;
const canvasHeight = canvasWidth;
const circleCount = 10;
const spawnAttempts = 500;
const circleSizeFactor = 30;
const mass = 1;
const g = 0.3;
const drag = 0.05;
const maxVelocity = 8;
const initialVelocity = 5;
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

		let position = {
			x: Math.floor((canvasWidth-2*radius)*Math.random()) + radius,
			y: Math.floor((canvasHeight-2*radius)*Math.random()) + radius,
		}
			
		for(let i=0; i<spawnAttempts; i++) {
			for(const other of newCircles) {
				if(LA.distance(position, other) > radius+other.r)
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

const step = (p) => {
	p.vx = clamp(p.vx, -maxVelocity, maxVelocity);
	p.vy = clamp(p.vy, -maxVelocity, maxVelocity);
	p.x += p.vx;
	p.y += p.vy;
}

const undoStep = (p) => {
	p.x -= p.vx;
	p.y -= p.vy;
}





const handleCollision = (c1, c2) => {

	const v1 = { x: c1.vx, y: c1.vy };
	const v2 = { x: c2.vx, y: c2.vy };

	const m1 = mass;
	const m2 = mass;

	const rv1 = LA.sub(v1, v2);
	const rv2 = LA.sub(v2, v1);

	const rp1 = LA.sub(c1, c2);
	const rp2 = LA.sub(c2, c1);

	const d = LA.distance(c1, c2);

	const v1dm = (1-energyLoss) * -(2 * m2) / (m1 + m2) * LA.dot(rv1, rp1) / d / d;
	const v2dm = (1-energyLoss) * -(2 * m1) / (m1 + m2) * LA.dot(rv2, rp2) / d / d;

	const v1d = LA.mult(v1dm, rp1);
	const v2d = LA.mult(v2dm, rp2);

	c1.vx = v1d.x;
	c1.vy = v1d.y;
	c2.vx = v2d.x;
	c2.vy = v2d.y;
}

const checkCollisions = (i) => {

	const c1 = circles[i];
	for(let j=0; j<circles.length; j++) {
		const c2 = circles[j];
		if(i !== j && LA.distance(c1, c2) < c1.r+c2.r) {
			undoStep(c1);
			undoStep(c2);
			handleCollision(c1, c2);
			step(c1);
			step(c2);
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
	
	for(let i=0; i<circles.length; i++) {

		const c = circles[i];
		c.vy = Math.min(maxVelocity, c.vy + g);

		step(c);
		checkCollisions(i);

	}

	updateEnergyDisplay();


	drawLoop();
}, 1000*timestep);

