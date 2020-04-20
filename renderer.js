var canvas
var ctx
var scale
var res
var dynamics
var charges
var multiplyer
var lastTime = 0
onmessage = function (evt) {
	if ('update' in evt.data)
		for (var key of evt.data.update) {
			console.log('updating key', key)
			this[key] = evt.data[key]
		} else {
			canvas = evt.data.canvas;
			ctx = canvas.getContext("2d");
			scale = evt.data.scale
			res = evt.data.res
			dynamics = evt.data.dynamics
			charges = evt.data.charges
			multiplyer = evt.data.multiplyer
			loop()
		}
}

function loop() {
	draw()
	requestAnimationFrame(loop)
}

function draw() {
	delta = (performance.now() - lastTime) / 1000
	lastTime = performance.now()
	console.log('render fps', 1 / delta)
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

function getFieldStrength(x, y) {
	strength = 0
	for (var e of charges) {
		dx = x - e.x
		dy = y - e.y
		r2 = dx * dx + dy * dy
		strength += multiplyer * e.q / r2
	}
	return strength
}

function getColor(dist, max = 5) {
	//calculated limit at which it switches to background color (exp(1/255))
	if (Math.abs(dist) < 1.0039076149) return 'rgb(0,255,0)'
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