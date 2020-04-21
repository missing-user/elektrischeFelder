var canvas = document.getElementById('canvas'),
	elemLeft = canvas.offsetLeft,
	elemTop = canvas.offsetTop,
	charges = [],
	dynamics = [],
	res = 20,
	lastTime = 0,
	hsvcolor = false
var ctx = canvas.getContext('2d')
var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
const constant = Math.PI * 4,
	scale = 100,
	limitSubstep = 1000
var paused = false
// Add event listener for `click` events.
canvas.addEventListener('mousedown', function (event) {
	var x = event.pageX - elemLeft,
		y = event.pageY - elemTop;
	console.log(event)
	if (event.button == 0) {
		charges.push({
			colour: 'rgb(255,255,255)',
			x: x / scale,
			y: y / scale,
			vx: 0,
			vy: 0,
			q: document.getElementById('positiveCharge').checked ? 1 : -1,
			dynamic: document.getElementById('dynamicc').checked,
			trail: []
		})
	} else {
		charges.push({
			colour: 'rgb(255,255,255)',
			x: x / scale,
			y: y / scale,
			vx: 0,
			vy: 0,
			q: !document.getElementById('positiveCharge').checked ? 1 : -1,
			dynamic: document.getElementById('dynamicc').checked,
			trail: []
		})
	}
	updateView()
}, false);
canvas.addEventListener("contextmenu", function (event) {
	console.log('context menu prevented');
	event.preventDefault();
})

function updateView() {
	dynamics = charges.filter((ch) => {
		return ch.dynamic
	})
}

function renderHighRes(btn) {
	if (btn.textContent == 'low res mode') {
		res = 10
		btn.textContent = 'high res mode'
	} else {
		res = 1
		btn.textContent = 'low res mode'
	}
}

function pause() {
	paused = !paused
}

function loop() {
	delta = (performance.now() - lastTime) / 1000
	lastTime = performance.now()
	//console.log(1 / delta); //print FPS
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
		charge.trail.push({
			x: charge.x,
			y: charge.y
		})
		if (charge.trail.length > 100) charge.trail = charge.trail.slice(1)
	}
	draw()
	requestAnimationFrame(loop)
}

function draw() {
	//update evvery pixel with the proper color value
	//index = 4 * i + 4 * j * canvas.width
	index = 0
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	for (var i = 0; i < canvas.width; i += res) {
		for (var j = 0; j < canvas.height; j += res) {
			c = getColor(getFieldStrength(j / scale, i / scale))
			//if the resolution is lower than one, fill the remaining pixels
			for (var k = 0; k < res * res; k++) {
				pixelOffset = (k) % res + ((k / res) | 0) * canvas.width
				pixelOffset *= 4
				imageData.data[index + pixelOffset] = c[0]
				imageData.data[index + pixelOffset + 1] = c[1]
				imageData.data[index + pixelOffset + 2] = c[2]
			}
			index += 4 * res
		}
		index += 4 * (res - 1) * canvas.width
	}
	ctx.putImageData(imageData, 0, 0)
	//draw a white dot on every charge
	for (var charge of charges) {
		ctx.fillStyle = charge.colour;
		ctx.fillRect(charge.x * scale - 1 + res / 2, charge.y * scale - 1 + res / 2, 2, 2);
	}
	//draw all the trails
	ctx.beginPath()
	for (charge of dynamics) {
		ctx.moveTo(charge.trail[0].x * scale + res / 2, charge.trail[0].y * scale + res / 2)
		for (var pos of charge.trail) {
			ctx.lineTo(pos.x * scale + res / 2, pos.y * scale + res / 2)
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
		strength += constant * e.q / r2
	}
	return strength
}

function getColor(dist) {
	//calculated limit at which it switches to background color (exp(1/255))
	if (Math.abs(dist) < 1.0039076149) {
		//8bit color will be green due to rounding, skip calc
		return [0, 255, 0]
	} else if (dist < 0) {
		//negative particle, same calculation but red and blue channels are flipped
		dist = -dist
		dist = Math.log(dist)
		if (dist > 5) dist = 5 //arbitrary max value that works
		if (hsvcolor) return hsvToRgb(0.3333333333333333333333 + dist / 15, 1, 1)
		ratio = dist * 51 //*255/5  (same max value as above)
		return [0, 255 - ratio, ratio]
	} else {
		//positive particle
		dist = Math.log(dist)
		if (dist > 5) dist = 5
		if (hsvcolor) return hsvToRgb(0.3333333333333333333333 - dist / 15, 1, 1)
		ratio = dist * 51 //*255/5  (same max value as above)
		return [ratio, 255 - ratio, 0]
	}
}

function hsvToRgb(h, s, v) {
	var r, g, b;
	var i = Math.floor(h * 6);
	var f = h * 6 - i;
	var p = v * (1 - s);
	var q = v * (1 - f * s);
	var t = v * (1 - (1 - f) * s);
	switch (i % 6) {
	case 0:
		r = v, g = t, b = p;
		break;
	case 1:
		r = q, g = v, b = p;
		break;
	case 2:
		r = p, g = v, b = t;
		break;
	case 3:
		r = p, g = q, b = v;
		break;
	case 4:
		r = t, g = p, b = v;
		break;
	case 5:
		r = v, g = p, b = q;
		break;
	}
	return [r * 255, g * 255, b * 255];
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
		strength = constant * e.q / r2
		if (r2 > 0) {
			dist = Math.sqrt(r2)
			vec.x += strength * dx / dist
			vec.y += strength * dy / dist
		}
	}
	return vec
}
//set the alpha for every pixel to 1
for (var i = 3; i < imageData.data.length; i += 4) {
	imageData.data[i] = 255
}
loop()