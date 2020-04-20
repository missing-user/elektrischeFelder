var dynamics
var charges
var multiplyer
var limitSubstep
var lastTime = 0
onmessage = function (evt) {
	if ('update' in evt.data) {
		for (var key of evt.data.update) {
			console.log('updating key', key)
			this[key] = evt.data[key]
		}
	} else {
		dynamics = evt.data.dynamics
		charges = evt.data.charges
		multiplyer = evt.data.multiplyer
		limitSubstep = evt.data.limitSubstep
		loop()
	}
}

function loop() {
	delta = (performance.now() - lastTime) / 1000
	lastTime = performance.now()
	console.log('physics fps', 1 / delta)
	if (delta > 0.1) delta = 0.1
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
		charge.trail.push({
			x: charge.x,
			y: charge.y
		})
		if (charge.trail.length > 100) charge.trail = charge.trail.slice(1)
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