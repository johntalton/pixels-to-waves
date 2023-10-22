
function lerp(t, a, b) {
	return t * (b - a) + a
}

function mapRange(v, a, b, c, d) {
	// return lerp((v - a) / (b - a), c, d)
	return (v - a) / (b - a) * (d - c) + c
}

function handleForm(config, event) {
	const { target: input } = event
	const [ file ] = input.files

	event.preventDefault()
	event.stopPropagation()

	input.disabled = true

	createImageBitmap(file)
		.then(imageBitmap => {
			input.disabled = false

			//
			const preview = document.getElementById('preview')
			const previewContext = preview.getContext('2d', {
				alpha: true,
				colorSpace: 'display-p3'
			})

			previewContext.clearRect(0, 0, preview.width, preview.height)
			previewContext.drawImage(imageBitmap,
				0, 0,imageBitmap.width, imageBitmap.height,
				0, 0, preview.width, preview.height)

			//
			const sourceImageData = getSourceImageData(imageBitmap, imageBitmap.width, imageBitmap.height)
			config.greys = getGreys(sourceImageData)
			config.greyWidth = sourceImageData.width
			config.greyHeight = sourceImageData.height

			//
			console.log('start animation')
			requestAnimationFrame(time => render(config, time))
		})
		.catch(e => console.warn(e))
}

function getSourceImageData(source, width, height) {
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

	// console.log('grays size', height, width)

	return Array.from({ length: width * height }, (_, i) => {
		const pixelIndex = i * 4
		const r = data[pixelIndex + 0]
		const g = data[pixelIndex + 1]
		const b = data[pixelIndex + 2]

		return Math.floor((r + g + b) / 3)
	})
}

function setup() {
	//
	const canvas = document.getElementById('canvas')
	const context = canvas.getContext('2d', {
		alpha: true,
		colorSpace: 'display-p3'
	})

	context.imageSmoothingEnabled = true

	return {
		canvas, context,
		lineCount: 50
	}
}

function strokeWave(config, y, freq, phase, maxAmplitude, time) {
	const { width, height } = config.canvas
	const { greys } = config

	const gWidth = config.greyWidth
	const gHeight = config.greyHeight

	let prevPoint = { x: -1, y }
	for(let x = 0; x < width; x++) {
		const gx = Math.floor(mapRange(x, 0, width, 0, gWidth))
		const gy = Math.floor(mapRange(y, 0, height, 0, gHeight))

		const grayIndex = Math.floor(gy * gWidth + gx)
		const grey = greys[grayIndex]

	  const angle = mapRange(gx, 0, gWidth, 0, Math.PI * 2)
	  const sinValue = Math.sin(phase + angle * freq)
	  const amplitude = mapRange(grey, 0, 255, maxAmplitude, 0)
	  const point = {
	    x: x,
	    y: y + sinValue * amplitude
	  }

		if(amplitude > 0.25) {
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
	const color = styles.getPropertyValue('--wave-color') || 'black'

	const { width, height } = config.canvas
	const lineHeight = height / config.lineCount

	config.context.strokeStyle = 'white'
	config.context.clearRect(0, 0, width, height)

	const freq = mapRange(Math.sin(time / 1000), -1, 1, 0, 300)
	const phase = 0 //time / 10000
	const maxAmplitude = lineHeight / 2 * 1.2

	for (let line = 0; line < config.lineCount; line++) {
		const y = line * lineHeight + lineHeight / 2

		if(false) {
			config.context.strokeStyle = 'black'
			config.context.beginPath()
			config.context.moveTo(0, y)
			config.context.lineTo(width, y)
			config.context.stroke()
		}

		config.context.strokeStyle = color
		strokeWave(config, y, freq, phase, maxAmplitude, time)
	}


	requestAnimationFrame(time => render(config, time))
}

async function onContentLoaded() {
	const config = setup()

	//
	globalThis.handleForm = event => handleForm(config, event)

	// requestAnimationFrame(time => render(config, time))
}

const syncOnContentLoaded = () => {
	onContentLoaded()
		.catch(console.warn)
}

(document.readyState === 'loading') ?
	document.addEventListener('DOMContentLoaded', syncOnContentLoaded) :
	syncOnContentLoaded()
