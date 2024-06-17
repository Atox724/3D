import { debounce } from "lodash-es";
import {
  DoubleSide,
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  Easing,
  Group as TweenGroup,
  Tween
} from "three/examples/jsm/libs/tween.module";

import { VIEW_WS } from "@/utils/websocket";

import { EgoCar } from "../public";
import Renderer from "../renderer";
import type Target from "../target";
import ArrowRender from "./ArrowRender";
import BoxRender from "./BoxRender";
import CrosswalkRender from "./CrosswalkRender";
import FreespaceRender from "./FreespaceRender";
import PolygonRender from "./PolygonRender";
import PolylineRender from "./PolylineRender";
import TextRender from "./TextRender";

export default class Virtual extends Renderer {
  createRender: Target[];

  ips: string[] = [];

  egoCar: EgoCar;

  controls?: OrbitControls;

  constructor() {
    super();

    this.egoCar = new EgoCar(this.scene);

    this.createRender = [
      new FreespaceRender(this.scene),
      new CrosswalkRender(this.scene),
      new ArrowRender(this.scene),
      new BoxRender(this.scene),
      new PolylineRender(this.scene),
      new PolygonRender(this.scene),
      new TextRender(this.scene)
    ];

    this.registerModelRender();

    window.addEventListener("keydown", this.onKeyDown);
  }

  registerModelRender() {
    for (const instance of this.createRender) {
      instance.topic.forEach((topic) => {
        VIEW_WS.registerTargetMsg(topic, instance.update.bind(instance));
      });
    }
    VIEW_WS.registerTargetMsg("conn_list", (data: { conn_list?: string[] }) => {
      this.ips = data.conn_list || [];
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
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
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

    this.scene.add(ground, gridHelper);
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    super.dispose();
  }
}
