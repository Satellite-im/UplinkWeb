<script lang="ts">
    import * as THREE from "three"
    import { STLLoader } from "three/addons/loaders/STLLoader.js"
    import { OrbitControls } from "three/addons/controls/OrbitControls.js"
    import { onMount } from "svelte"
  
    export let url: string = ""

    export let size: number = 400

    let container: HTMLDivElement
  
    let camera: THREE.PerspectiveCamera
    let scene: THREE.Scene
    let renderer: THREE.WebGLRenderer
    let controls: OrbitControls
  
    onMount(() => {
      init()
      animate()
    })
  
    function init() {
      camera = new THREE.PerspectiveCamera(50, size / size, 0.1, 100)
      camera.position.set(0, 0, 2)
  
      scene = new THREE.Scene()
      scene.background = null
  
      const loader = new STLLoader()
      loader.load(url, function (geometry: THREE.BufferGeometry) {
        const material = new THREE.MeshPhongMaterial({ color: 0xf7f1e3, specular: 0x494949, shininess: 200 })
        const mesh = new THREE.Mesh(geometry, material)
  
        mesh.position.set(0, 0, 0)
        scene.add(mesh)
      })
  
      scene.add(new THREE.HemisphereLight(0xffffff, 0x444444))
  
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(size, size)
      container.appendChild(renderer.domElement)
  
      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.screenSpacePanning = false
      controls.minDistance = 0.1
      controls.maxDistance = 200
      controls.zoomSpeed = 1.2 
    
      window.addEventListener('resize', onWindowResize)
    }
  
    function onWindowResize() {
      camera.aspect = size / size
      camera.updateProjectionMatrix()
      renderer.setSize(size, size)
    }
  
    function animate() {
      requestAnimationFrame(animate)
      controls.update()  // only required if controls.enableDamping = true, or if controls.autoRotate = true
      render()
    }
  
    function render() {
      renderer.render(scene, camera)
    }
</script>

<div bind:this={container} class="stl-container"></div>

<style>
  .stl-container {
    width: 100%;
    height: 400px;
    display: block;
    overflow: hidden;
  }
</style>
