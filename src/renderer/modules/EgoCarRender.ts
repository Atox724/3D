import type { Object3D, Scene } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { EgoCar } from "@/assets/model";

import BasicTarget from "../basic_target";

const gltfLoader = new GLTFLoader();

export default class EgoCarRender extends BasicTarget {
  topic = [];

  car?: Object3D;

  constructor(scene: Scene) {
    super(scene);
    this.loadCar();
  }

  async loadCar() {
    const gltf = await gltfLoader.loadAsync(EgoCar);
    const model = gltf.scene;
    this.car = model;
    this.scene.add(model);
  }

  update(data: any[]) {
    console.log(data);
  }
}
