<script>
    import * as THREE from "three";
    import { onMount } from "svelte";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

    import earth from "./assets/earth.jpg";
    let earthContainer;
    export let earth_opacity = 0.3;

    onMount(() => {
        initEarth();
    });



    function initEarth() {
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            75,
            1, // 確保比例為 1:1
            0.1,
            1000
        );
        camera.position.set(0, 0, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(300, 300); // 設置固定大小
        renderer.setClearColor(0x000000, 0); // 透明背景
        earthContainer.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.minDistance = 3;
        controls.maxDistance = 3;

        const textureLoader = new THREE.TextureLoader();
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        const material = new THREE.MeshBasicMaterial({ map: textureLoader.load(earth) , transparent: true , opacity: earth_opacity});
        const earthMesh = new THREE.Mesh(geometry, material);
        scene.add(earthMesh);


        
        const animate = () => {
            requestAnimationFrame(animate);
            earthMesh.rotation.x += 0.001; // 地球自轉
            earthMesh.rotation.y += 0.002; // 地球自轉

            
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        
    }
</script>

<div id="earth-container" bind:this={earthContainer}></div>

<style>
    #earth-container {
        position: absolute;
        top: 0; /* 置於上半部分（視窗頂部以下10%處） */
        left: 50%; /* 水平居中 */
        transform: translate(-50%, 0); /* 修正水平居中 */
        width: 300px;
        height: 300px;
        filter: drop-shadow(0 0 8px rgba(255, 255, 0, 1));
        
        /* border: 1px solid #FFD700;
        box-shadow: 0 0 16px 10px rgba(255, 255, 255, 0.5); */
    }
</style>