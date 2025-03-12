import './style.css';

const canvasWidth = 500;
const canvasHeight = canvasWidth;
const circleCount = 5;
const spawnAttempts = 500;
const circleSizeFactor = 30;
const mass = 1;
const g = 0;
const energyLoss = 0.3;
const maxVelocity = 10;
const initialVelocity = 7;
const backgroundColor = '#000'
const friction = 0.00;
const timestep = 0.02;
const debug = false;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
canvas.width = canvasWidth;
canvas.height = canvasHeight;

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
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2); 
	ctx.fillStyle = '#32d8c3';
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

const hue = (r, g, b) => {
    r /= 255; 
	g /= 255; 
	b /= 255;
    const max = Math.max(r, g, b); 
	const min = Math.min(r, g, b);
	const d = max - min;
    let h = 0; 

    if(d === 0) return 0; 

    switch(max) {
        case r: h = ((g - b) / d) % 6; break;
        case g: h = ((b - r) / d) + 2; break;
        case b: h = ((r - g) / d) + 4; break;
    }

    h = Math.round(h * 60);
    return h < 0 ? h + 360 : h;
}




const handleCollision = (c1, c2) => {
	const v1 = { x: c1.vx, y: c1.vy };
	const v2 = { x: c2.vx, y: c2.vy };
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

	c1.vx = v1d.x;
	c1.vy = v1d.y;
	c2.vx = v2d.x;
	c2.vy = v2d.y;
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
	ctx.fillStyle = '#00f';
	for(const circle of circles)
		drawCircle(circle.x, circle.y, circle.r);

	// Debug
	
	if(debug) {
		for(const c of circles) {
			const n = normalize({ x: c.vx, y: c.vy });
			const t = { x: n.y, y: -n.x };
			const mag = 70;
			ctx.strokeStyle = '#00f';
			drawLine(c.x, c.y, c.x + mag * n.x, c.y + mag * n.y);
			ctx.strokeStyle = '#f00';
			drawLine(c.x, c.y, c.x + mag * t.x, c.y + mag * t.y);

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


