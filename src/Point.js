export default class Point {

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	add(other) {
		this.x += other.x;
		this.y += other.y;
	}

	sub(other) {
		this.x -= other.x;
		this.y -= other.y;
	}

	mult(scalar) {
		this.x *= scalar;
		this.y *= scalar;
	}

	div(scalar) {
		this.x /= scalar;
		this.y /= scalar;
	}

	mag() { Math.sqrt(this.x**2 + this.y**2) }

	normalize() { 
		const mag = this.mag();
		return new Point(
			this.x / mag,
			this.y / mag
		);
	}

}
