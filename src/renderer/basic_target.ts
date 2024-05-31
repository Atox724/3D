import {
  AnimationMixer,
  Mesh,
  type Object3D,
  type Scene,
  SkinnedMesh
} from "three";

export const targetZIndex = {
  frespace: 0.01,
  crosswalk: 0.05
};

export default abstract class BasicTarget<T = object> {
  scene: Scene;

  modelList: Record<string, Object3D>;

  abstract readonly topic: string[];

  constructor(scene: Scene) {
    this.scene = scene;

    this.modelList = {};
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

  clear() {
    Object.keys(this.modelList).forEach((id) => {
      this.disposeObject(this.modelList[id]);
    });
    this.modelList = {};
  }

  abstract update(data: T[]): void;
}
