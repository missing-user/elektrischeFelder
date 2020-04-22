var canvas
var ctx
var scale
var res
var dynamics
var charges
var constant
var lastTime = 0
var imageData
var hsvcolor = true
onmessage = function (evt) {
	if ('update' in evt.data)
		for (var key of evt.data.update) {
			this[key] = evt.data[key]
		} else {
			canvas = evt.data.canvas;
			ctx = canvas.getContext("2d");
			scale = evt.data.scale
			res = evt.data.res
			dynamics = evt.data.dynamics
			charges = evt.data.charges
			constant = evt.data.constant
			imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
			//set the alpha for every pixel to 1
			for (var i = 3; i < imageData.data.length; i += 4) {
				imageData.data[i] = 255
			}
			loop()
		}
}

function loop() {
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
	if (charges.length == 0) {
		ctx.font = '60px sans-serif'
		ctx.fillText('Click to add particles', 230, 450)
	}
	//draw a white dot on every charge
	for (var charge of charges) {
		ctx.fillStyle = charge.colour
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