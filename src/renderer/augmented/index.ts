import {
  CylinderGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PlaneGeometry
} from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector";

import { VIEW_WS } from "@/utils/websocket";

import Renderer from "..";
import {
  EgoCar,
  Obstacle,
  Participant,
  RoadMarker,
  TrafficSignal
} from "../public";
import TrafficLight from "../public/TrafficLight";
import type Render from "../render";
import CrosswalkRender from "./CrosswalkRender";
import EgoCarRender from "./EgoCarRender";
import FreespaceRender from "./FreespaceRender";
import ObstacleRender from "./ObstacleRender";
import ParticipantRender from "./ParticipantRender";
import PolylineRender from "./PolylineRender";
import RoadMarkerRender from "./RoadMarkerRender";
import TrafficLightRender from "./TrafficLightRender";
import TrafficSignalRender from "./TrafficSignalRender";

export default class Augmented extends Renderer {
  createRender: Render[];

  ips: string[] = [];

  constructor() {
    super();

    this.createRender = [
      new EgoCarRender(this.scene),
      new FreespaceRender(this.scene),
      new CrosswalkRender(this.scene),
      new PolylineRender(this.scene),
      new ObstacleRender(this.scene),
      new ParticipantRender(this.scene),
      new TrafficLightRender(this.scene),
      new TrafficSignalRender(this.scene),
      new RoadMarkerRender(this.scene)
    ];

    VIEW_WS.on("conn_list", (data) => {
      this.ips = (data as unknown as { conn_list?: string[] }).conn_list || [];
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
      Obstacle,
      Participant,
      TrafficLight,
      TrafficSignal,
      RoadMarker
    ];
    return Promise.allSettled(
      preloadArray.map((modelRender) => modelRender.preloading())
    );
  }

  initialize(canvasId: string) {
    super.initialize(canvasId);
    this.updateControler();
    this.setScene();
  }

  updateControler() {
    this.controls.target.set(3, 0, 6);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;

    this.updateControls();

    this.controls.addEventListener("end", this.resetCamera);
  }

  createGround() {
    const geometry = new PlaneGeometry(500, 500);
    const material = new MeshPhongMaterial({
      color: 0x525862,
      side: DoubleSide
    });
    const plane = new Mesh(geometry, material);
    plane.position.z = -0.01;

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
    cylinder.position.z = geometry.parameters.height / 2 - 0.01;
    cylinder.rotation.x = Math.PI / 2;

    this.scene.add(cylinder);
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
