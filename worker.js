onmessage = function (evt) {
	const canvas = evt.data.canvas;
	const ctx = canvas.getContext("2d");
	const scale = evt.data.scale
	const res = evt.data.res
	const dynamics = evt.data.dynamics
	const charges = evt.data.charges
	const multiplyer = evt.data.multiplyer

	function render(time) {
		// ... some drawing using the gl context ...
		console.log(time);
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
		requestAnimationFrame(render)
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
	requestAnimationFrame(render)
}