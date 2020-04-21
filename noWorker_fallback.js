var canvas = document.getElementById('canvas'),
	elemLeft = canvas.offsetLeft,
	elemTop = canvas.offsetTop,
	charges = [],
	dynamics = [],
	res = 20,
	lastTime = 0,
	hsvcolor = true,
	chargev = 1,
	walls = true
var ctx = canvas.getContext('2d')
var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
const constant = Math.PI * 4,
	scale = 100,
	limitSubstep = 500
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
			q: document.getElementById('positiveCharge').checked ? chargev : -chargev,
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
			q: !document.getElementById('positiveCharge').checked ? chargev : -chargev,
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

function renderHighRes(value) {
	res = (value) | 0
	res = closest([1, 2, 4, 5, 8, 10, 20, 25, 40, 50], res)
	console.log(res)
}

function toggleHsv(value) {
	hsvcolor = value
}

function closest(array, num) {
	var i = 0;
	var minDiff = 1000;
	var ans;
	for (i in array) {
		var m = Math.abs(num - array[i]);
		if (m < minDiff) {
			minDiff = m;
			ans = array[i];
		}
	}
	return ans;
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
			if (charge.vx * charge.vx + charge.vy * charge.vy > 2000) {
				v2 = charge.vx * charge.vx + charge.vy * charge.vy
				charge.vx *= 2000 / v2
				charge.vy *= 2000 / v2
			}
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
			if (charge.x > canvas.width / scale) {
				charge.x = canvas.width / scale
				charge.vx = -charge.vx
			}
			if (charge.y > canvas.height / scale) {
				charge.y = canvas.height / scale
				charge.vy = -charge.vy
			}
		}
		charge.trail.push({
			x: charge.x,
			y: charge.y
		})
		if (charge.trail.length > 250) charge.trail = charge.trail.slice(charge.trail.length - 250)
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
			for (let k = 0; k < res; k++) {
				for (let foo = 0; foo < res; foo++) {
					pixelOffset = k + foo * canvas.width
					pixelOffset *= 4
					imageData.data[index + pixelOffset] = c[0]
					imageData.data[index + pixelOffset + 1] = c[1]
					imageData.data[index + pixelOffset + 2] = c[2]
				}
			}
			index += 4 * res
		}
		index += 4 * (res - 1) * canvas.width
	}
	ctx.putImageData(imageData, 0, 0)
	//draw a white dot on every charge
	for (var charge of charges) {
		ctx.fillStyle = charge.colour;
		ctx.fillRect(charge.x * scale - 2 + res / 2, charge.y * scale - 2 + res / 2, 4, 4)
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

function wall(value) {
	walls = value
	console.log(walls);
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
//set the alpha for every pixel to 1
for (var i = 3; i < imageData.data.length; i += 4) {
	imageData.data[i] = 255
}
loop()