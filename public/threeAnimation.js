import {visibleHeightAtZDepth, visibleWidthAtZDepth, lerp} from "/utils.js"
import {nextSlide, previousSlide} from "/main.js"

const raycaster = new THREE.Raycaster()
const objLoader = new THREE.OBJLoader()

let arrowBox = null
let arrowBoxPrev = null

let arrowBoxRotation = 0

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight)

const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera)

document.body.append(renderer.domElement)

objLoader.load(
  'models/cube.obj',
  ({children}) => {
    const screenBorderRight = visibleWidthAtZDepth(-10, camera) / 2
    const screenBottom = -visibleHeightAtZDepth(-10, camera) / 2

    arrowBox = addCube(children[0], nextSlide, screenBorderRight - 1.5, screenBottom + 1, 0)
    animate()
  }
)

objLoader.load(
  'models/cubePrev.obj',
  ({children}) => {
    const screenBorderRight = visibleWidthAtZDepth(-10, camera) / 2
    const screenBottom = -visibleHeightAtZDepth(-10, camera) / 2

    arrowBoxPrev = addCube(children[0], previousSlide, screenBorderRight - 2.5, screenBottom + 1, 180)
    animate()

  }
)

const addCube = (object, callbackFn, x, y, rotation) => {
  const cubeMesh = object.clone()

  cubeMesh.scale.setScalar(.3)
  cubeMesh.rotation.set(THREE.Math.degToRad(90), THREE.Math.degToRad(rotation), 0)

  const boundingBox = new THREE.Mesh(
      new THREE.BoxGeometry(.7, .7, .7),
      new THREE.MeshBasicMaterial({transparent: true, opacity: 0})
  )

  boundingBox.position.x = x
  boundingBox.position.y = y
  boundingBox.position.z = -10

  boundingBox.add(cubeMesh)

  boundingBox.callbackFn = callbackFn

  let arrowBox = boundingBox
  scene.add(boundingBox)

  return arrowBox
}

const animate = () => {
  arrowBoxRotation = lerp(arrowBoxRotation, 0, .07)
  if (arrowBoxRotation < 0) {
    arrowBoxPrev.rotation.set(THREE.Math.degToRad(arrowBoxRotation), 0, 0)
  } else {
    arrowBox.rotation.set(THREE.Math.degToRad(arrowBoxRotation), 0, 0)
  }

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

export const handleThreeAnimation = (deg) => {
    arrowBoxRotation = deg
}

window.addEventListener('click', () => {
  const mousePosition = new THREE.Vector2()
  mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1
  mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mousePosition, camera)

  const interesctedObjects = raycaster.intersectObjects([arrowBox])
  interesctedObjects.length && interesctedObjects[0].object.callbackFn()

  const interesctedObjectsPrev = raycaster.intersectObjects([arrowBoxPrev])
  interesctedObjectsPrev.length && interesctedObjectsPrev[0].object.callbackFn()
})