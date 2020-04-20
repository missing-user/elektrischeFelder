var canvas
var ctx
var scalw
var res
var dynamics
var charges
var multiplyer
var limitSubstep
var lastTime = 0
onmessage = function (evt) {
	if ('update' in evt.data)
		for (var key of evt.data.update) {
			console.log('updating key', key)
			this[key] = evt.data[key]
			dynamics = charges.filter((ch) => {
				return ch.dynamic
			})
		} else {
			canvas = evt.data.canvas;
			ctx = canvas.getContext("2d");
			scale = evt.data.scale
			res = evt.data.res
			dynamics = evt.data.dynamics
			charges = evt.data.charges
			multiplyer = evt.data.multiplyer
			limitSubstep = evt.data.limitSubstep
		}
	requestAnimationFrame(loop)
}

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
			ctx.lineTo(pos.x * scale, pos.y * scale)
		}
	}
	ctx.stroke()
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