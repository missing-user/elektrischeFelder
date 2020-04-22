var dynamics
var charges
var constant
var limitSubstep
var lastTime = 0
var paused = false
var walls = true
var width
var height
var scale
onmessage = function (evt) {
	if ('update' in evt.data) {
		for (var key of evt.data.update) {
			console.log('updating key', key, 'to', evt.data[key])
			this[key] = evt.data[key]
		}
	} else {
		dynamics = evt.data.dynamics
		charges = evt.data.charges
		height = evt.data.height
		width = evt.data.width
		scale = evt.data.scale
		constant = evt.data.constant
		limitSubstep = evt.data.limitSubstep
		loop()
	}
}

function loop() {
	delta = (performance.now() - lastTime) / 1000
	lastTime = performance.now()
	if (delta > 0.1) delta = 0.1
	if (paused) delta = 0
	dt = delta / limitSubstep
	for (var i = 0; i < limitSubstep; i++)
		for (charge of dynamics) {
			fv = getFieldVector(charge.x, charge.y)
			charge.vx += fv.x * charge.q * dt
			charge.vy += fv.y * charge.q * dt
			charge.x += charge.vx * dt
			charge.y += charge.vy * dt
		}
	for (charge of dynamics) {
		if (walls) {
			if (charge.x < 0) {
				charge.x = 0
				charge.vx = -charge.vx
			}
			if (charge.y < 0) {
				charge.y = 0
				charge.vy = -charge.vy
			}
			if (charge.x > width / scale) {
				charge.x = width / scale
				charge.vx = -charge.vx
			}
			if (charge.y > height / scale) {
				charge.y = height / scale
				charge.vy = -charge.vy
			}
		}
		charge.trail.push({
			x: charge.x,
			y: charge.y
		})
		if (charge.trail.length > 250) charge.trail = charge.trail.slice(charge.trail.length - 250)
	}
	postMessage({
		charges: charges,
		dynamics: dynamics,
	})
	requestAnimationFrame(loop)
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
		if (r2 < 0.01) r2 = 0.01
		strength = constant * e.q / r2
		if (r2 > 0) {
			dist = Math.sqrt(r2)
			vec.x += strength * dx / dist
			vec.y += strength * dy / dist
		}
	}
	return vec
}