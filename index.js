
function lerp(t, a, b) {
  t * (a + (b - a))
}

// map a value `v` from domain a-b to domain c-d
function mapRange(v, a, b, c, d) {
  // return lerp((v - a) / (b - a), c, d)
  // return (v - a) / (b - a) * (c + (d - c))
  return (v - a) / (b - a) * (d - c) + c
}

console.log(mapRange(5, 0, 10, 0, 1))
console.log(mapRange(25, 0, 100, 0, 2))
console.log(mapRange(25, 0, 100, 10, 20))

function setup() {
  const canvas = document.getElementById('canvas')
	const context = canvas.getContext('2d', {
		alpha: true,
		colorSpace: 'display-p3'
	})

	context.imageSmoothingEnabled = true

  return {
    canvas, context
  }
}

function render(config) {
  const { width, height } = config.canvas

  config.context.strokeStyle = 'white'

  let prevPoint = { x: -1, y: height / 2 }

  for(let x = 0; x < width; x++) {
    const angle = mapRange(x, 0, width, 0, Math.PI * 2)
    const sinValue = Math.sin(angle)
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
