import { ElMessage, type MessageHandler } from "element-plus";
import { debounce } from "lodash-es";
import {
  AmbientLight,
  AnimationMixer,
  DefaultLoadingManager,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Timer } from "three/examples/jsm/misc/Timer";

import { CameraMode } from "@/typings";
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

  position = new Vector3();
  rotation = new Vector3();

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

    this.switchCameraMode();

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

  switchCameraMode(mode = CameraMode.FOLLOW_EGOCAR) {
    switch (mode) {
      case CameraMode.BV_VERTICAL:
        this.camera.position.z = 140;
        this.updateCamera = this.updateCameraFollowingCar;
        break;
      case CameraMode.BV_HORIZONTAL:
        this.camera.position.z = 140;
        this.camera.rotation.z = Math.PI / 2;
        this.updateCamera = this.updateCameraFollowingCar;
        break;
      case CameraMode.FOLLOW_EGOCAR:
        this.updateCamera = this.updateCameraFollowingCar;
        break;
      case CameraMode.USER_CONTROL:
        this.updateCamera = this.updateCameraUserControl;
        break;
      default:
        this.updateCamera = this.updateCameraFollowingCar;
        break;
    }
  }
  cameraDirection = new Vector3();
  last_position = new Vector3();

  syncCameraAttributes() {
    const controlCamera = this.controls?.object || this.camera;

    this.camera.position.z = controlCamera.position.z;
    this.camera.rotation.x = controlCamera.rotation.x;
    this.camera.rotation.y = controlCamera.rotation.y;
    this.camera.rotation.z = controlCamera.rotation.z;
  }

  updateCamera = () => {};

  updateCameraFollowingCar() {
    const controlCamera = this.controls?.object || this.camera;
    const originPos = this.controls?.position0 || this.camera.position;

    controlCamera.getWorldDirection(this.cameraDirection);
    // 计算controlCamera的方向与X轴的夹角
    const direction_theta = Math.atan2(
      this.cameraDirection.y,
      this.cameraDirection.x
    );
    // 计算controlCamera与原点的直线距离（俯视角度下）
    const camera2carDistance = Math.sqrt(
      originPos.x * originPos.x + originPos.y * originPos.y
    );
    // 将controlCamera的属性同步给camera
    this.syncCameraAttributes();
    // 计算并更新camera的位置（结合自车位置与controlCamera交互的结果来计算）
    this.camera.position.x =
      this.position.x -
      camera2carDistance * Math.cos(this.rotation.z + direction_theta);
    this.camera.position.y =
      this.position.y -
      camera2carDistance * Math.sin(this.rotation.z + direction_theta);

    // 更新camera的中心位置，camera看向自车
    this.camera.lookAt(this.position.x, this.position.y, this.position.z + 2);
    // 备份自车位置，用于切换视角
    this.last_position.x = this.position.x;
    this.last_position.y = this.position.y;
    this.last_position.z = this.position.z;
  }

  updateCameraUserControl() {
    const originPos = this.controls?.position0 || this.camera.position;

    // 将controlCamera的属性同步给camera
    this.syncCameraAttributes();
    // 获取controlCamera的位置
    const x = originPos.x;
    const y = originPos.y;
    const z = originPos.z;
    // 基于备份的自车数据来计算
    if (this.last_position.x !== this.position.x) {
      this.last_position.x = this.position.x;
      this.last_position.y = this.position.y;
      this.last_position.z = this.position.z;
    }
    // 计算并更新camera的位置（结合备份的自车数据与controlCamera交互的结果来计算）
    this.camera.position.x = this.last_position.x + x;
    this.camera.position.y = this.last_position.y + y;
    this.camera.position.z = this.last_position.z + z;
  }

  createLights() {
    const ambientLight = new AmbientLight(0xffffff, 0.8);
    const hemisphereLight = new HemisphereLight(0xffffff, 0x000000, 1);
    hemisphereLight.position.set(0, 0, 1);
    this.scene.add(ambientLight, hemisphereLight);
  }

  renderLoop() {
    this.updateCamera();
    // if (this.controls) {
    //   this.camera.position.copy(this.controls.object.position);
    //   this.camera.rotation.set(
    //     this.controls.object.rotation.x,
    //     this.controls.object.rotation.y,
    //     this.controls.object.rotation.z
    //   );
    // }
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
