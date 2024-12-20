<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  export let width;
  export let color;
  export let opacity;
  let canvasContainer;

  onMount(() => {
    let width = canvasContainer.clientWidth;
    let height = canvasContainer.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 6.6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    canvasContainer.appendChild(renderer.domElement);


    // 增加外层球体
    const outerGeometry = new THREE.IcosahedronGeometry(4.1, 2);
    const outerMaterial = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
    const outerSphere = new THREE.Mesh(outerGeometry, outerMaterial);
    scene.add(outerSphere);

    // 设置自转轴
    const rotationAxis = new THREE.Vector3(0.1, 0.3, 0.1).normalize();

    // 动画函数
    function animate() {
      requestAnimationFrame(animate);

      // 旋转外层球体
      outerSphere.rotateOnAxis(rotationAxis, 0.1);

      renderer.render(scene, camera);
    }
    animate();

    function updateDimensions() {
      camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    }

    window.addEventListener('resize', updateDimensions);

    return () => {
      canvasContainer.removeChild(renderer.domElement);
      renderer.dispose();
      window.removeEventListener('resize', updateDimensions);
    };
  });
  </script>

<div bind:this={canvasContainer} style="width: {width}px; height: {width}px; opacity:{opacity}"></div>