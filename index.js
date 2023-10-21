
function lerp(t, a, b) {
	return t * (b - a) + a
}

function mapRange(v, a, b, c, d) {
	return lerp((v - a) / (b - a), c, d)
	// return (v - a) / (b - a) * (d - c) + c
}

// console.log(mapRange(5, 0, 10, 0, 1))
// console.log(mapRange(25, 0, 100, 0, 2))
// console.log(mapRange(25, 0, 100, 10, 20))

function getSourceImageData(source) {
	const { naturalWidth: width, naturalHeight: height } = source

	// console.log('source size', height, width)

	const offscreen = new OffscreenCanvas(width, height)
	const offscreenContext = offscreen.getContext('2d', {
		alpha: true,
		colorSpace: 'display-p3'
	})
	offscreenContext.imageSmoothingEnabled = false

	offscreenContext.drawImage(source, 0, 0, width, height)

	const imageData = offscreenContext.getImageData(0, 0, width, height)

	return imageData
}

function getGreys(imageData) {
	const { data, height, width } = imageData

	console.log('grays size', height, width)

	return Array.from({ length: width * height }, (_, i) => {
		const pixelIndex = i * 4
		const r = data[pixelIndex + 0]
		const g = data[pixelIndex + 1]
		const b = data[pixelIndex + 2]

		return Math.floor((r + g + b) / 3)
	})
}

async function setup() {
	const canvas = document.getElementById('canvas')
	const context = canvas.getContext('2d', {
		alpha: true,
		colorSpace: 'display-p3'
	})

	context.imageSmoothingEnabled = true

	const sourceElem = document.getElementById('source')

	return new Promise(resolve => {
		const commonResolve = () => {
			const sourceImageData = getSourceImageData(sourceElem)
			const greys = getGreys(sourceImageData)
			resolve({
				canvas, context, sourceImageData,
				lineCount: 100,
				greys
			})
		}

		if (sourceElem.complete) {
			commonResolve()
			return
		}

		sourceElem.addEventListener('load', event => {
			commonResolve()
		}, { once: true })
	})
}

function strokeWave(config, y, freq, phase, maxAmplitude, time) {
	const { width, height } = config.canvas
	const { greys } = config

	let prevPoint = { x: -1, y }
	for(let x = 0; x < width; x++) {
		const grayIndex = Math.floor(y) * width + x
		const grey = greys[grayIndex]

	  const angle = mapRange(x, 0, width, 0, Math.PI * 2)
	  const sinValue = Math.sin(phase + angle * freq)
	  const amplitude = mapRange(grey, 0, 255, maxAmplitude, 0)
	  const point = {
	    x: x,
	    y: y + sinValue * amplitude
	  }

		if(amplitude > 0.15) {
			config.context.beginPath()
			config.context.moveTo(prevPoint.x, prevPoint.y)
			config.context.lineTo(point.x, point.y)
			config.context.stroke()
		}

	  prevPoint = point
	}
}

function render(config, time) {
	const styles = getComputedStyle(config.canvas)
	const color = styles.getPropertyValue('--wave-color')

	const { width, height } = config.canvas
	const lineHeight = height / config.lineCount

	config.context.strokeStyle = 'white'
	config.context.clearRect(0, 0, width, height)

	const freq = mapRange(Math.sin(time / 620), -1, 1, 20, 200)
	const phase = 0 //time / 500
	const maxAmplitude = lineHeight / 2

	for (let line = 0; line < config.lineCount; line++) {
		const y = line * lineHeight + lineHeight / 2

		// config.context.beginPath()
    // config.context.moveTo(0, y)
    // config.context.lineTo(width, y)
    // config.context.stroke()

		config.context.strokeStyle = color
		strokeWave(config, y, freq, phase, maxAmplitude, time)
	}


	requestAnimationFrame(time => render(config, time))
}

async function onContentLoaded() {
	const config = await setup()
	requestAnimationFrame(time => render(config, time))
}

const syncOnContentLoaded = () => {
	onContentLoaded()
		.catch(console.warn)
}

(document.readyState === 'loading') ?
	document.addEventListener('DOMContentLoaded', syncOnContentLoaded) :
	syncOnContentLoaded()
