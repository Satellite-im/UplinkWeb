<script lang="ts">
    import * as THREE from "three"
    import { STLLoader } from "three/addons/loaders/STLLoader.js"
    import { onMount } from "svelte"
  
    export let url: string = ""


    let height = 400
    let width = 400

    let container: HTMLDivElement
  
    let camera: THREE.PerspectiveCamera
    let cameraTarget: THREE.Vector3
    let scene: THREE.Scene
    let renderer: THREE.WebGLRenderer
  
    onMount(() => {
      init()
      animate()
    })
  
    function init() {
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 50)
      let scale = 0.15

      camera.position.set(0, 0, 0)
  
      cameraTarget = new THREE.Vector3(0, -0.55, 0)
  
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x000000)

      const loader = new STLLoader()
      loader.load(url, function (geometry: THREE.BufferGeometry) {
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xeeeeee, shininess: 200 })
        const mesh = new THREE.Mesh(geometry, material)
  
        mesh.position.set(0, 0, 0)
        mesh.rotation.set(0, 0, 0)
        mesh.scale.set(scale, scale, scale)
  
        mesh.castShadow = true
        mesh.receiveShadow = true
  
        scene.add(mesh)
      })
  
      scene.add(new THREE.HemisphereLight(0x0, 0x0, 3))
      addShadowedLight(1, 1, 1, 0xffffff, 3.5)
      addShadowedLight(0.5, 1, -1, 0xffffff, 3)
  
      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(width, height)
      renderer.shadowMap.enabled = true
      container.appendChild(renderer.domElement)
  
      window.addEventListener('resize', onWindowResize)
    }
  
    function addShadowedLight(x: number, y: number, z: number, color: number, intensity: number) {
      const directionalLight = new THREE.DirectionalLight(color, intensity)
      directionalLight.position.set(x, y, z)
      scene.add(directionalLight)
  
      directionalLight.castShadow = true
  
      const d = 1
      directionalLight.shadow.camera.left = -d
      directionalLight.shadow.camera.right = d
      directionalLight.shadow.camera.top = d
      directionalLight.shadow.camera.bottom = -d
  
      directionalLight.shadow.camera.near = 1
      directionalLight.shadow.camera.far = 4
  
      directionalLight.shadow.bias = -0.002
    }
  
    function onWindowResize() {
      camera.aspect = 1
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
  
    function animate() {
      requestAnimationFrame(animate)
      render()
    }
  
    function render() {
      const timer = Date.now() * 0.0005
  
      camera.position.x = Math.cos(timer) * 3
      camera.position.z = Math.sin(timer) * 3
  
      camera.lookAt(cameraTarget)
  
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