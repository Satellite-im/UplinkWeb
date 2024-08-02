<script lang="ts">
    import * as THREE from "three"
    import Text from "$lib/elements/Text.svelte"
    import { STLLoader } from "three/addons/loaders/STLLoader.js"
    import { OrbitControls } from "three/addons/controls/OrbitControls.js"
    import { onMount } from "svelte"
    import { Appearance, Shape, Size } from "$lib/enums"
    import prettyBytes from "pretty-bytes"
    import Icon from "$lib/elements/Icon.svelte"
    import { Button } from "$lib/elements"
    import { _ } from "svelte-i18n"

    export let url: string = ""
    export let wireframe: boolean = false
    export let size: number = 400
    export let name: string = ""
    export let filesize: number = 0

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
        camera = new THREE.PerspectiveCamera(50, size / size, 0.1, 2000)
        camera.position.set(0, 0, 0)

        scene = new THREE.Scene()
        scene.background = new THREE.Color(0x000000)

        const loader = new STLLoader()
        loader.load(url, function (geometry: THREE.BufferGeometry) {
            const material = new THREE.MeshPhongMaterial({ color: 0xb66a50, specular: 0xffffff, shininess: 2000, wireframe })
            const mesh = new THREE.Mesh(geometry, material)

            mesh.position.set(0, 0, 0)
            scene.add(mesh)
        })

        scene.add(new THREE.HemisphereLight(0xffffff, 0x61554a))

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(size, size)
        container.appendChild(renderer.domElement)

        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.screenSpacePanning = true
        controls.minDistance = 0.1
        controls.zoom0 = 50
        controls.maxDistance = 200
        controls.zoomSpeed = 1.2

        window.addEventListener("resize", onWindowResize)
    }

    function onWindowResize() {
        camera.aspect = size / size
        camera.updateProjectionMatrix()
        renderer.setSize(size, size)
    }

    function animate() {
        requestAnimationFrame(animate)
        controls.update()
        render()
    }

    function render() {
        renderer.render(scene, camera)
    }
</script>

<div class="stl">
    <div bind:this={container} class="stl-container"></div>
    <div class="details">
        <Text size={Size.Smaller}>{name} ({prettyBytes(filesize)})</Text>
        <Button text={$_("files.download")} appearance={Appearance.Alt}>
            <Icon icon={Shape.ArrowDown} />
        </Button>
    </div>
</div>

<style lang="scss">
    .stl {
        background-color: var(--background-alt);
        padding: var(--padding);
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        border-radius: var(--border-radius-medium);

        .stl-container {
            width: 100%;
            height: 400px;
            display: block;
            overflow: hidden;
            border-radius: var(--border-radius);
        }
        .details {
            display: inline-flex;
            flex-direction: row;
            gap: var(--gap);
            justify-content: space-between;
            align-items: center;
        }
    }
</style>
