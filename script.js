var canvas = document.getElementById('canvas'),
	elemLeft = canvas.offsetLeft,
	elemTop = canvas.offsetTop,
	ctx = canvas.getContext('2d'),
	elements = [];
const multiplyer = Math.PI * 4
// Add event listener for `click` events.
canvas.addEventListener('mousedown', function (event) {
	var x = event.pageX - elemLeft,
		y = event.pageY - elemTop;
	console.log(x, y);
	elements.push({
		colour: '#055AFF',
		y: y,
		x: x,
		q: 500
	});
	updateView()
}, false);

function updateView() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < canvas.width; i++) {
		for (var j = 0; j < canvas.height; j++) {
			let strength = 0
			for (var e of elements) {
				dx = i - e.x
				dy = j - e.y
				r2 = dx * dx + dy * dy
				strength += multiplyer * e.q / (r2)
			}
			ctx.fillStyle = getColor(strength)
			ctx.fillRect(i, j, 1, 1);
		}
	}
	for (var element of elements) {
		ctx.fillStyle = element.colour;
		ctx.fillRect(element.x - 2, element.y - 2, 4, 4);
	}
}

function getColor(dist, max = 5) {
	dist = Math.log(dist)
	if (dist > max) dist = max
	ratio = dist / max * 255
	return ['rgb(', ratio, ',', 255 - ratio, ',0)'].join('')
}