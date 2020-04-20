var canvas = document.getElementById('canvas'),
	ctx = canvas.getContext('2d')
elemLeft = canvas.offsetLeft,
	elemTop = canvas.offsetTop,
	charges = [],
	dynamics = [],
	res = 10,
	lastTime = 0
//var offscreen = canvas.transferControlToOffscreen()
const multiplyer = Math.PI * 4,
	scale = 100,
	limitSubstep = 100
var paused = false
/*var worker = new Worker("worker.js");
worker.postMessage({
	canvas: offscreen
}, [offscreen])*/
// Add event listener for `click` events.
canvas.addEventListener('mousedown', function (event) {
	var x = event.pageX - elemLeft,
		y = event.pageY - elemTop;
	console.log(event);
	if (event.button == 0) charges.push({
		colour: 'rgb(255,255,255)',
		x: x / scale,
		y: y / scale,
		q: event.button == 0 ? 1 : -1,
		dynamic: false
	});
	else {
		charges.push({
			colour: 'rgb(255,255,255)',
			x: x / scale,
			y: y / scale,
			vx: 0,
			vy: 0,
			q: -1,
			dynamic: true,
			trail: []
		});
	}
	updateView()
}, false);
canvas.addEventListener("contextmenu", function (event) {
	console.log('context menu prevented');
	event.preventDefault();
});

function loop() {
	delta = (performance.now() - lastTime) / 1000
	lastTime = performance.now()
	if (delta > 0.1) delta = 0.1
	console.log(delta)
	dt = delta / limitSubstep
	for (var i = 0; i < limitSubstep; i++)
		for (charge of dynamics) {
			fv = getFieldVector(charge.x, charge.y)
			charge.vx += fv.x * charge.q * dt
			charge.vy += fv.y * charge.q * dt
			charge.x += charge.vx * dt
			charge.y += charge.vy * dt
		}
	for (charge of dynamics) charge.trail.push({
		x: charge.x,
		y: charge.y
	})
	draw()
	if (!paused) requestAnimationFrame(loop)
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < canvas.width; i += res) {
		for (var j = 0; j < canvas.height; j += res) {
			ctx.fillStyle = getColor(getFieldStrength(i / scale, j / scale))
			ctx.fillRect(i, j, res, res);
		}
	}
	for (var charge of charges) {
		ctx.fillStyle = charge.colour;
		ctx.fillRect(charge.x * scale - 1 + res / 2, charge.y * scale - 1 + res / 2, 2, 2);
	}
	ctx.beginPath()
	for (charge of dynamics) {
		ctx.moveTo(charge.trail[0].x * scale, charge.trail[0].y * scale)
		for (var pos of charge.trail) {
			ctx.lineTo(pos.x * scale + res / 2, pos.y * scale + res / 2)
		}
	}
	ctx.stroke()
}

function updateView() {
	console.log('highres view update')
	dynamics = charges.filter((ch) => {
		return ch.dynamic
	})
}

function renderHighRes() {
	res = 1
	paused = false
	draw()
	res = 10
}

function pause() {
	if (paused) {
		paused = false
		loop()
	} else {
		paused = true
	}
}

function getFieldVector(x, y) {
	vec = {
		x: 0,
		y: 0
	}
	for (var e of charges) {
		dx = x - e.x
		dy = y - e.y
		r2 = dx * dx + dy * dy
		if (r2 < 0.0005) r2 = 0.0005
		strength = multiplyer * e.q / r2
		if (r2 > 0) {
			dist = Math.sqrt(r2)
			vec.x += strength * dx / dist
			vec.y += strength * dy / dist
		}
	}
	return vec
}

function getFieldStrength(x, y) {
	strength = 0
	for (var e of charges) {
		dx = x - e.x
		dy = y - e.y
		r2 = dx * dx + dy * dy
		if (r2 < 0.0005) r2 = 0.0005
		strength += multiplyer * e.q / r2
	}
	return strength
}

function getColor(dist, max = 5) {
	if (dist < 0) {
		dist = -dist
		dist = Math.log(dist)
		if (dist > max) dist = max
		ratio = dist / max * 255
		return ['rgb(0,', 255 - ratio, ',', ratio, ')'].join('')
	} else {
		dist = Math.log(dist)
		if (dist > max) dist = max
		ratio = dist / max * 255
		return ['rgb(', ratio, ',', 255 - ratio, ',0)'].join('')
	}
}
loop()