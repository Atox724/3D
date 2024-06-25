import {
  DoubleSide,
  GridHelper,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector3
} from "three";

import type { EnableEvent } from "@/typings";
import { VIEW_WS } from "@/utils/websocket";

import Renderer from "..";
import {
  EgoCar,
  type EgoCarUpdateData,
  Pole,
  RoadMarker,
  TrafficLight,
  TrafficSignal
} from "../public";
import type Render from "../render";
import ArrowRender from "./ArrowRender";
import BoxRender from "./BoxRender";
import CrosswalkRender from "./CrosswalkRender";
import EgoCarRender from "./EgoCarRender";
import EllipseRender from "./EllipseRender";
import FixedPolygonRender from "./FixedPolygonRender";
import FreespaceRender from "./FreespaceRender";
import PoleRender from "./PoleRender";
import PolygonRender from "./PolygonRender";
import PolylineRender from "./PolylineRender";
import RoadMarkerRender from "./RoadMarkerRender";
import TextRender from "./TextRender";
import TrafficLightRender from "./TrafficLightRender";
import TrafficSignalRender from "./TrafficSignalRender";

export default class Virtual extends Renderer<EnableEvent> {
  createRender: Render[];

  ips: string[] = [];

  ground = new Group();

  constructor() {
    super();

    this.createRender = [
      new EgoCarRender(this.scene),
      new FreespaceRender(this.scene),
      new CrosswalkRender(this.scene),
      new PolylineRender(this.scene),
      new TextRender(this.scene),
      new ArrowRender(this.scene),
      new BoxRender(this.scene),
      new PolygonRender(this.scene),
      new EllipseRender(this.scene),
      new FixedPolygonRender(this.scene),
      new RoadMarkerRender(this.scene),
      new PoleRender(this.scene),
      new TrafficLightRender(this.scene),
      new TrafficSignalRender(this.scene)
    ];

    let updatedPos = false;

    const prePos = new Vector3();

    VIEW_WS.on(
      "car_pose",
      (data: { topic: "car_pose"; data: EgoCarUpdateData }) => {
        const [{ position, rotation }] = data.data.data;
        if (!updatedPos) {
          this.ground.position.copy(position);
          this.ground.rotation.z = rotation.z;
          updatedPos = true;
        }

        const deltaPos = new Vector3().copy(position).sub(prePos);

        this.camera.position.add(deltaPos);

        this.controls.target.add(deltaPos);

        prePos.copy(position);

        this.updateControls();
      }
    );

    VIEW_WS.on("conn_list", (data) => {
      this.ips = (data as unknown as { conn_list?: string[] }).conn_list || [];
    });

    this.createRender.forEach((render) => {
      this.on("enable", (data) => {
        if (render.type === data.type) {
          render.createRender[data.topic]?.setEnable(data.enable);
        }
      });
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
    const preloadArray = [RoadMarker, Pole, TrafficLight, TrafficSignal];
    return Promise.allSettled(
      preloadArray.map((modelRender) => modelRender.preloading())
    );
  }

  initialize(canvasId: string) {
    super.initialize(canvasId);
    this.updateControler();
    this.setScene();
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (!e.ctrlKey) return;
    if (e.code === "Space") {
      e.preventDefault();
      this.resetCamera();
    }
  };

  updateControler() {
    this.controls.target.set(3, 0, 6);
    this.updateControls();
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
    ground.position.z = -0.3;
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
