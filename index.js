
function lerp(t, a, b) {
  return t * (a + (b - a))
}

function mapRange(v, a, b, c, d) {
  return lerp((v - a) / (b - a), c, d)
  // return (v - a) / (b - a) * (d - c) + c
}

// console.log(mapRange(5, 0, 10, 0, 1))
// console.log(mapRange(25, 0, 100, 0, 2))
// console.log(mapRange(25, 0, 100, 10, 20))

function getSourceImageData(source) {
  const { width, height } = source

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

function setup() {
  const canvas = document.getElementById('canvas')
	const context = canvas.getContext('2d', {
		alpha: true,
		colorSpace: 'display-p3'
	})

	context.imageSmoothingEnabled = true

  const sourceImageData = getSourceImageData(document.getElementById('source'))

  return {
    canvas, context, sourceImageData
  }
}

function render(config, time) {
  const { width, height } = config.canvas

  config.context.strokeStyle = 'white'
  config.context.clearRect(0, 0, width, height)

  let prevPoint = { x: -1, y: height / 2 }

  for(let x = 0; x < width; x++) {
    const angle = mapRange(x, 0, width, 0, Math.PI * 2)
    const freq = 10
    const phase = time / 120
    const sinValue = Math.sin(phase + angle * freq)
    const amplitude = height / 2
    const point = {
      x: x,
      y: height / 2 + sinValue * amplitude
    }

    config.context.beginPath()
    config.context.moveTo(prevPoint.x, prevPoint.y)
    config.context.lineTo(point.x, point.y)
    config.context.stroke()

    prevPoint = point

  }

  requestAnimationFrame(time => render(config, time))
}

async function onContentLoaded() {
  const config = setup()
  render(config)
}

const syncOnContentLoaded = () => {
	onContentLoaded()
		.catch(console.warn)
}

(document.readyState === 'loading') ?
	document.addEventListener('DOMContentLoaded', syncOnContentLoaded) :
	syncOnContentLoaded()
