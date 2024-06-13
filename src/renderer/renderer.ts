import { ElMessage, type MessageHandler } from "element-plus";
import { debounce } from "lodash-es";
import {
  AmbientLight,
  AnimationMixer,
  CircleGeometry,
  CylinderGeometry,
  DefaultLoadingManager,
  DoubleSide,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Easing, Tween } from "three/examples/jsm/libs/tween.module";
import { Timer } from "three/examples/jsm/misc/Timer";
import { Reflector } from "three/examples/jsm/objects/Reflector";

import { EgoCarRender } from "@/renderer/public";
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
  controls?: OrbitControls;

  egoCarRender?: EgoCarRender;

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

    this.egoCarRender = new EgoCarRender(this.scene);
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

    this.createControler();

    this.createLights();

    this.setScene();

    this.render();
  }

  updateDimension(width: number, height: number) {
    if (!this.initialized) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  resetCamera = debounce(() => {
    if (!this.controls) return;
    const tween = new Tween(this.camera.position);
    tween
      .to(this.controls.position0)
      .easing(Easing.Quadratic.InOut)
      .onStart(() => {
        if (!this.controls) return;
        this.controls.enabled = false;
      })
      .onComplete(() => {
        if (!this.controls) return;
        this.controls.enabled = true;
      })
      .start();
    let rafId: number;
    const tweenAnimate = () => {
      rafId = requestAnimationFrame(() => {
        const playing = tween.update();
        if (playing) tweenAnimate();
        else cancelAnimationFrame(rafId);
      });
    };
    tweenAnimate();
  }, 2500);

  createControler() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(3, 0, 6);
    this.controls.enablePan = false;
    // this.controls.enableDamping = true;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.saveState();

    // this.controls.addEventListener("end", this.resetCamera);
  }

  createLights() {
    const ambientLight = new AmbientLight(0xffffff, 0.8);
    const hemisphereLight = new HemisphereLight(0xffffff, 0x000000, 1);
    hemisphereLight.position.set(0, 0, 1);
    this.scene.add(ambientLight, hemisphereLight);
  }

  createGround() {
    const geometry = new PlaneGeometry(500, 500);
    const material = new MeshPhongMaterial({
      color: 0x525862,
      side: DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const plane = new Mesh(geometry, material);
    plane.position.z = 0.005;

    const reflector = new Reflector(geometry, {
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio
    });

    this.scene.add(reflector, plane);
  }

  setScene() {
    // this.scene.fog = new FogExp2(0x525862, 0.02);
    const size = 1000;
    const geometry = new CylinderGeometry(size / 2, size / 2, size);
    const material = new MeshBasicMaterial({
      color: 0x525862,
      side: DoubleSide
    });
    const cylinder = new Mesh(geometry, material);
    cylinder.position.z = geometry.parameters.height / 2;
    cylinder.rotation.x = Math.PI / 2;

    const reflector = new Reflector(new CircleGeometry(size / 2), {
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio
    });

    reflector.position.z = 0.005;

    this.scene.add(cylinder, reflector);
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
    this.controls?.removeEventListener("end", this.resetCamera);
    this.controls?.dispose();
    this.stats.dispose();
    this.initialized = false;
  }
}
