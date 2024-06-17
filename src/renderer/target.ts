import {
  AnimationMixer,
  Mesh,
  type Object3D,
  type Scene,
  SkinnedMesh
} from "three";

export default abstract class Target {
  scene: Scene;

  renderOrder: number;

  modelList: Map<string | number, Object3D>;

  abstract topic: readonly string[];

  constructor(scene: Scene, renderOrder: number) {
    this.scene = scene;
    this.renderOrder = renderOrder;

    this.modelList = new Map();
  }

  disposeObject(obj: Object3D) {
    obj.traverse((child) => {
      if (child instanceof Mesh) {
        child.geometry.dispose();

        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            material.dispose();
          });
        } else {
          child.material.dispose();
        }
      }
      if (child instanceof SkinnedMesh) {
        child.skeleton.dispose();
      }
    });

    this.scene.remove(obj);
    const mixerKey = obj.userData.type + obj.userData.id + "Mixer";
    const mixer = this.scene.userData.mixers?.[mixerKey] as AnimationMixer;
    if (mixer) {
      mixer.stopAllAction();
      obj.animations?.forEach((animation) => {
        mixer.uncacheAction(animation);
      });
      delete this.scene.userData.mixers[mixerKey];
    }
  }

  clear(list = this.modelList) {
    list.forEach(this.disposeObject.bind(this));
    list.clear();
  }

  checkModelByData<D extends Array<any>>(data: D, list = this.modelList) {
    list.forEach((model, id) => {
      if (!data.find((item) => +item.id === +id)) {
        this.disposeObject(model);
        list.delete(id);
      }
    });
  }

  abstract update(data: any, topic?: string): void;
}
