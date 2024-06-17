import { debounce } from "lodash-es";
import {
  DoubleSide,
  GridHelper,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector3
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  Easing,
  Group as TweenGroup,
  Tween
} from "three/examples/jsm/libs/tween.module";

import { VIEW_WS } from "@/utils/websocket";

import Renderer from "..";
import { EgoCar, type EgoCarUpdateData } from "../public";
import type Render from "../render";
import ArrowRender from "./ArrowRender";
import BoxRender from "./BoxRender";
import CrosswalkRender from "./CrosswalkRender";
import EgoCarRender from "./EgoCarRender";
import FreespaceRender from "./FreespaceRender";
import PolygonRender from "./PolygonRender";
import PolylineRender from "./PolylineRender";
import TextRender from "./TextRender";

export default class Virtual extends Renderer {
  createRender: Render[];

  ips: string[] = [];

  controls?: OrbitControls;

  ground = new Group();

  constructor() {
    super();

    this.createRender = [
      new EgoCarRender(this.scene),
      new FreespaceRender(this.scene),
      new CrosswalkRender(this.scene),
      new ArrowRender(this.scene),
      new BoxRender(this.scene),
      new PolylineRender(this.scene),
      new PolygonRender(this.scene),
      new TextRender(this.scene)
    ];

    let updatedPos = false;
    VIEW_WS.on(
      "car_pose",
      (data: { topic: "car_pose"; data: EgoCarUpdateData }) => {
        const [{ position, rotation }] = data.data.data;
        if (!updatedPos) {
          this.ground.position.copy(position);
          this.ground.rotation.z = rotation.z;
          updatedPos = true;
        }
        this.position.copy(position);
        this.rotation.set(rotation.x, rotation.y, rotation.z);
      }
    );

    VIEW_WS.on("conn_list", (data: { conn_list?: string[] }) => {
      this.ips = data.conn_list || [];
    });

    window.addEventListener("keydown", this.onKeyDown);

    this.preload();
  }

  preload() {
    EgoCar.preloading().then((res) => {
      res.forEach((item) => {
        if (item.status === "fulfilled") {
          this.scene.add(item.value);
        }
      });
    });
  }

  initialize(canvasId: string) {
    super.initialize(canvasId);
    this.createControler();
    this.setScene();
  }

  resetCamera = debounce(() => {
    if (!this.controls) return;
    const group = new TweenGroup();
    const tween1 = new Tween(this.controls.object.position);
    tween1.to(this.controls.position0).easing(Easing.Quadratic.InOut).start();

    const tween2 = new Tween(this.controls.target);
    tween2
      .to(this.controls.target0)
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
    group.add(tween1);
    group.add(tween2);
    let rafId: number;
    const tweenAnimate = () => {
      rafId = requestAnimationFrame(() => {
        const playing = group.update();
        if (playing) tweenAnimate();
        else cancelAnimationFrame(rafId);
      });
    };
    tweenAnimate();
  }, 2500);

  onKeyDown = (e: KeyboardEvent) => {
    if (!e.ctrlKey) return;
    if (e.code === "Space") {
      e.preventDefault();
      this.resetCamera();
    }
  };

  createControler() {
    this.controls = new OrbitControls(
      this.camera.clone(),
      this.renderer.domElement
    );
    this.controls.target.set(3, 0, 6);
    this.controls.saveState();
  }

  setScene() {
    const size = 1000;
    const gridHelper = new GridHelper(size / 2, size / 20, 0x888888, 0x888888);
    gridHelper.rotation.x = Math.PI / 2;

    const geometry = new PlaneGeometry(size / 2, size / 2);
    const material = new MeshBasicMaterial({
      color: 0x232829,
      side: DoubleSide
    });
    const ground = new Mesh(geometry, material);
    ground.position.z = -0.01;
    this.ground.add(ground, gridHelper);
    this.scene.add(this.ground);
  }

  dispose(): void {
    this.createRender.forEach((target) => {
      target.dispose();
    });
    this.createRender = [];
    VIEW_WS.off("conn_list");
    window.removeEventListener("keydown", this.onKeyDown);
    super.dispose();
  }
}
