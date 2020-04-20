var canvas = document.getElementById('canvas')
elemLeft = canvas.offsetLeft,
	elemTop = canvas.offsetTop,
	charges = [],
	dynamics = [],
	res = 10,
	lastTime = 0
var offscreen = canvas.transferControlToOffscreen()
const multiplyer = Math.PI * 4,
	scale = 100,
	limitSubstep = 100
var paused = false
var worker = new Worker("worker.js")
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
})
worker.addEventListener('message', function (ev) {
	if (ev.data.msg === 'render') {
		ctx.transferFromImageBitmap(ev.data.bitmap);
	}
})
worker.postMessage({
	dynamics: dynamics,
	charges: charges,
	scale: scale,
	res: res,
	multiplyer: multiplyer,
	canvas: offscreen,
	limitSubstep: limitSubstep
}, [offscreen])

function updateView() {
	worker.postMessage({
		charges: charges,
		update: ['charges']
	}, [offscreen])
}

function renderHighRes() {
	worker.postMessage({
		res: 1,
		update: ['res']
	}, [offscreen])
}

function pause() {
	if (paused) {
		paused = false
		loop()
	} else {
		paused = true
	}
}