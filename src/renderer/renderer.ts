import { ElMessage, type MessageHandler } from "element-plus";
import { debounce } from "lodash-es";
import {
  AmbientLight,
  AnimationMixer,
  DefaultLoadingManager,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Timer } from "three/examples/jsm/misc/Timer";

import Stats from "@/utils/stats";

// 监听3d场景绘制进度
let hideThreeLoading: MessageHandler | null;
DefaultLoadingManager.onStart = () => {
  if (!hideThreeLoading) {
    hideThreeLoading = ElMessage.info({
      message: "3d场景加载中",
      duration: 0
    });
  }
};
DefaultLoadingManager.onLoad = () => {
  if (hideThreeLoading) {
    hideThreeLoading.close();
    hideThreeLoading = null;
  }
};

export default abstract class Renderer {
  initialized: boolean;

  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;

  timer: Timer;

  resizeOb?: ResizeObserver;
  abstract controls?: OrbitControls;

  stats: Stats;

  constructor() {
    this.initialized = false;

    this.renderer = new WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(-22, 0, 12);

    this.timer = new Timer();

    this.stats = new Stats();
  }

  initialize(canvasId: string) {
    this.initialized = true;
    const container = document.getElementById(canvasId);
    if (!container) throw new Error(`Container not found: ${canvasId}`);
    const { clientWidth: width, clientHeight: height } = container;

    this.updateDimension(width, height);
    this.resizeOb = new ResizeObserver(
      debounce(() => {
        this.updateDimension(container.clientWidth, container.clientHeight);
      }, 200)
    );
    this.resizeOb.observe(container);

    container.appendChild(this.renderer.domElement);

    this.createLights();

    this.render();
  }

  updateDimension(width: number, height: number) {
    if (!this.initialized) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  createLights() {
    const ambientLight = new AmbientLight(0xffffff, 0.8);
    const hemisphereLight = new HemisphereLight(0xffffff, 0x000000, 1);
    hemisphereLight.position.set(0, 0, 1);
    this.scene.add(ambientLight, hemisphereLight);
  }

  renderLoop() {
    this.timer.update();
    const delta = this.timer.getDelta();
    this.controls?.update(delta);

    if (this.scene.userData.mixers) {
      Object.values<AnimationMixer>(this.scene.userData.mixers).forEach(
        (mixer) => {
          mixer.update(delta);
        }
      );
    }

    this.renderer.render(this.scene, this.camera);

    this.stats.update();
  }

  render() {
    this.renderer.setAnimationLoop(this.renderLoop.bind(this));
  }

  dispose() {
    this.renderer.domElement.remove();
    this.renderer.dispose();
    this.resizeOb?.disconnect();
    this.controls?.dispose();
    this.stats.dispose();
    this.initialized = false;
  }
}
