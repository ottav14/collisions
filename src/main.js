import './style.css';
import * as LA from './la.js';
import { hue, clamp } from './util.js';
import Point from './Point.js';
import Circle from './Circle.js';
import * as PARAMS from './params.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
canvas.width = PARAMS.canvasWidth;
canvas.height = PARAMS.canvasHeight;

const createCircles = () => {
	const newCircles = [];
	for(let i=0; i<PARAMS.circleCount; i++) {
		const mass = Math.random()*(PARAMS.maxMass-PARAMS.minMass)+PARAMS.minMass;
		const radius = mass * PARAMS.circleSizeFactor;
		const h = 360*Math.random();
		const col = hue(h);

		const cpr = 10;
		const pos = new Point(
			Math.random()*(PARAMS.canvasWidth-2*radius),
			Math.random()*(PARAMS.canvasHeight-2*radius)
		);

		const vx = Math.random()*2*PARAMS.initialVelocity - PARAMS.initialVelocity;
		const vy = Math.random()*2*PARAMS.initialVelocity - PARAMS.initialVelocity;

		const vel = new Point(vx, vy);

		newCircles.push(new Circle(pos, vel, radius, mass, col)); 

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
		totalEnergy += 0.5 * PARAMS.minMass * v * v;
	}
	energyDisplay.textContent = `Energy: ${totalEnergy}`;
}



const drawCircle = (c) => {
	ctx.beginPath();
	ctx.fillStyle = c.col;
	ctx.arc(c.pos.x, c.pos.y, c.r, 0, Math.PI * 2); 
	ctx.fill();
}

const drawLine = (x1, y1, x2, y2) => {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

const drawLoop = () => {
	ctx.fillStyle = PARAMS.backgroundColor;
	ctx.fillRect(0, 0, PARAMS.canvasWidth, PARAMS.canvasHeight);
	for(const c of circles)
		drawCircle(c);

	// Debug
	
	if(PARAMS.debug) {
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
		c.update(circles);
		

	}

	updateEnergyDisplay();


	drawLoop();
}, 1000*PARAMS.timestep);


