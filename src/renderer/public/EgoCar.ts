import type { Object3D, Scene } from "three";

import { EgoCar as EgoCarModel } from "@/assets/model";
import Target from "@/renderer/target";
import gltfLoader from "@/utils/three/gltfLoader";

export default class EgoCar extends Target {
  topic = [];

  car?: Object3D;

  constructor(scene: Scene, renderOrder = 0) {
    super(scene, renderOrder);
    this.loadCar();
  }

  async loadCar() {
    const gltf = await gltfLoader.loadAsync(EgoCarModel);
    const model = gltf.scene;
    this.car = model;
    this.scene.add(model);
  }

  update(data: any[]) {
    console.log(data);
  }
}
