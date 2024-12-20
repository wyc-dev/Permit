<!-- Logo.svelte -->
<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  let canvasContainer;
  export let outer = 2;
  export let ball = true;
  export let power_opacity = 1;

  onMount(() => {
    let width = canvasContainer.clientWidth;
    let height = canvasContainer.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 7.1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    canvasContainer.appendChild(renderer.domElement);

    // 创建闪电形状
    const lightningShape = new THREE.Shape();
    lightningShape.moveTo(0, 3);
    lightningShape.lineTo(0.5, 1.5);
    lightningShape.lineTo(0.5, 1.5);
    lightningShape.lineTo(1.5, -1.5);
    lightningShape.lineTo(0, -0.5);
    lightningShape.lineTo(0.5, -3);
    lightningShape.lineTo(-0.5, -1);
    lightningShape.lineTo(-0.5, -1);
    lightningShape.lineTo(-1.5, 1);
    lightningShape.lineTo(0, 0);

    // 创建挤出设置
    const extrudeSettings = {
      steps: 2,
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 1
    };

    // 创建闪电的几何体
    const lightningGeometry = new THREE.ExtrudeGeometry(lightningShape, extrudeSettings);

    // 创建闪电的实心材质，支持透明度
    const solidMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700, // 金色
      transparent: true,
      opacity: 1
    });

    // 创建闪电的网格
    const lightningMesh = new THREE.Mesh(lightningGeometry, solidMaterial);
    scene.add(lightningMesh);

    // 创建轮廓层
    const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.BackSide });
    const outlineMesh = new THREE.Mesh(lightningGeometry, outlineMaterial);
    outlineMesh.scale.multiplyScalar(1.1); // slightly larger to create an outline effect
    scene.add(outlineMesh);

    // 增加外层球体
    const outerGeometry = new THREE.IcosahedronGeometry(4.1, outer);
    const outerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const outerSphere = new THREE.Mesh(outerGeometry, outerMaterial);
    scene.add(outerSphere);

    // 设置自转轴
    const rotationAxis = new THREE.Vector3(0.1, 0.3, 0.1).normalize();

    // 动画函数
    function animate() {
      requestAnimationFrame(animate);

      // 旋转闪电实体
      lightningMesh.rotateOnAxis(rotationAxis, 0.01);
      outlineMesh.rotateOnAxis(rotationAxis, 0.01);

      // 旋转外层球体
      outerSphere.rotateOnAxis(rotationAxis, 30);

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

<div bind:this={canvasContainer} style="width: 100%; height: 100%; filter: drop-shadow(0 0 16px rgba(255, 255, 255, 0.5));"></div>