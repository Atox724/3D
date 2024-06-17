import { debounce } from "lodash-es";
import {
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PlaneGeometry
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Easing, Tween } from "three/examples/jsm/libs/tween.module";
import { Reflector } from "three/examples/jsm/objects/Reflector";

import { DepthTester } from "@/utils/three/depthTester";
import { VIEW_WS } from "@/utils/websocket";

import Renderer from "..";
import { EgoCar, Obstacle, Participant, TrafficSignal } from "../public";
import TrafficLight from "../public/TrafficLight";
import type Render from "../render";
import CrosswalkRender from "./CrosswalkRender";
import EgoCarRender from "./EgoCarRender";
import FreespaceRender from "./FreespaceRender";
import ObstacleRender from "./ObstacleRender";
import ParticipantRender from "./ParticipantRender";
import PolylineRender from "./PolylineRender";
import TrafficLightRender from "./TrafficLightRender";
import TrafficSignalRender from "./TrafficSignalRender";

export default class Augmented extends Renderer {
  createRender: Render[];

  ips: string[] = [];

  controls?: OrbitControls;

  constructor() {
    super();

    this.createRender = [
      new EgoCarRender(this.scene),
      new ObstacleRender(this.scene),
      new ParticipantRender(this.scene),
      new FreespaceRender(this.scene),
      new TrafficLightRender(this.scene),
      new TrafficSignalRender(this.scene),
      new CrosswalkRender(this.scene),
      new PolylineRender(this.scene)
    ];

    VIEW_WS.on("conn_list", (data: { conn_list?: string[] }) => {
      this.ips = data.conn_list || [];
    });

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
    const preloadArray = [
      EgoCar,
      Obstacle,
      Participant,
      TrafficLight,
      TrafficSignal
    ];
    return Promise.allSettled(
      preloadArray.map((modelRender) => modelRender.preloading())
    );
  }

  initialize(canvasId: string) {
    super.initialize(canvasId);
    this.createControler();
    this.setScene();
  }

  resetCamera = debounce(() => {
    if (!this.controls) return;
    const tween = new Tween(this.controls.target);
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
    this.controls.enableDamping = true;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.saveState();
    this.controls.addEventListener("end", this.resetCamera);
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
    plane.position.z = Math.min(DepthTester.BASE_DEPTH * 0.8, 0.005);

    const reflector = new Reflector(geometry, {
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio
    });

    this.scene.add(reflector, plane);
  }

  setScene() {
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

    reflector.position.z = Math.min(DepthTester.BASE_DEPTH * 0.8, 0.005);

    this.scene.add(cylinder, reflector);
  }

  dispose() {
    this.createRender.forEach((target) => {
      target.dispose();
    });
    this.createRender = [];
    VIEW_WS.off("conn_list");
    this.controls?.removeEventListener("end", this.resetCamera);
    super.dispose();
  }
}
