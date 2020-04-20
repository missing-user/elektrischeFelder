var canvas = document.getElementById('canvas'),
	elemLeft = canvas.offsetLeft,
	elemTop = canvas.offsetTop,
	charges = [],
	dynamics = [],
	res = 10,
	lastTime = 0
var offscreen = canvas.transferControlToOffscreen()
const constant = Math.PI * 4,
	scale = 100,
	limitSubstep = 1000
var paused = false
var renderer = new Worker("renderer.js")
var physicsWorker = new Worker("physics.js")
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

function renderHighRes(btn) {
	if (btn.textContent == 'low res mode') {
		renderer.postMessage({
			res: 10,
			update: ['res']
		})
		btn.textContent = 'high res mode'
	} else {
		renderer.postMessage({
			res: 1,
			update: ['res']
		})
		btn.textContent = 'low res mode'
	}
}

function pause() {
	paused = !paused
	physicsWorker.postMessage({
		paused: paused,
		update: ['paused']
	})
}