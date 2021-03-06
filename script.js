var canvas = document.getElementById('canvas'),
	charges = [],
	dynamics = [],
	res = 10,
	lastTime = 0,
	hsvcolor = true,
	chargev = 1,
	walls = false
var offscreen = canvas.transferControlToOffscreen()
var positiveCharge = true,
	dynamicc = true
const constant = Math.PI * 4,
	scale = 100,
	limitSubstep = 2500
var paused = false
var renderer = new Worker("renderer.js")
var physicsWorker = new Worker("physics.js")
// Add event listener for `click` events.
canvas.addEventListener('mousedown', function (event) {
	let rect = canvas.getBoundingClientRect();
	console.log(rect);
	let x = event.clientX - rect.left;
	x *= canvas.width / rect.width
	let y = event.clientY - rect.top;
	y *= canvas.height / rect.height
	console.log(event)
	if (event.button == 0) {
		charges.push({
			colour: 'rgb(255,255,255)',
			x: x / scale,
			y: y / scale,
			vx: 0,
			vy: 0,
			q: positiveCharge ? chargev : -chargev,
			dynamic: dynamicc,
			trail: []
		})
	} else {
		charges.push({
			colour: 'rgb(255,255,255)',
			x: x / scale,
			y: y / scale,
			vx: 0,
			vy: 0,
			q: !positiveCharge ? chargev : -chargev,
			dynamic: dynamicc,
			trail: []
		})
	}
	updateView()
}, false);
canvas.addEventListener("contextmenu", function (event) {
	console.log('context menu prevented');
	event.preventDefault();
})
physicsWorker.addEventListener('message', function (event) {
	charges = event.data.charges
	dynamics = event.data.dynamics
	renderer.postMessage({
		charges: charges,
		dynamics: dynamics,
		update: ['charges', 'dynamics']
	})
})
renderer.postMessage({
	dynamics: dynamics,
	charges: charges,
	scale: scale,
	res: res,
	constant: constant,
	canvas: offscreen
}, [offscreen])
physicsWorker.postMessage({
	dynamics: dynamics,
	charges: charges,
	constant: constant,
	width: canvas.width,
	height: canvas.height,
	scale: scale,
	limitSubstep: limitSubstep
})

function updateView() {
	dynamics = charges.filter((ch) => {
		return ch.dynamic
	})
	physicsWorker.postMessage({
		charges: charges,
		dynamics: dynamics,
		update: ['charges', 'dynamics']
	})
}

function renderHighRes(value) {
	res = (value) | 0
	res = closest([1, 2, 4, 5, 8, 10, 20, 25, 40, 50], res)
	//closest divisor of the canvas resulution
	renderer.postMessage({
		res: res, //fast integer parsing
		update: ['res']
	})
}

function toggleHsv(value) {
	hsvcolor = value
	renderer.postMessage({
		hsvcolor: hsvcolor,
		update: ['hsvcolor']
	})
}

function wall(value) {
	walls = value
	physicsWorker.postMessage({
		walls: walls,
		update: ['walls']
	})
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
	physicsWorker.postMessage({
		paused: paused,
		update: ['paused']
	})
}