import type { Object3D } from "three";

import { EgoCar as EgoCarModel } from "@/assets/model";
import Target from "@/renderer/target";
import type { UpdateDataTool } from "@/typings";
import gltfLoader from "@/utils/three/gltfLoader";

enum EgoCarTypeEnum {
  EGO_CAR = "EGO_CAR"
}
type EgoCarType = keyof typeof EgoCarTypeEnum;

interface DataType {
  posWGS84: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "car_pose";
}

export default class EgoCar extends Target {
  static cacheModels = {} as Record<EgoCarType, Object3D>;
  static modelFiles: Record<EgoCarType, string> = {
    EGO_CAR: EgoCarModel
  };

  static preloading() {
    const proms = [];
    let key: keyof typeof EgoCar.modelFiles;
    for (key in EgoCar.modelFiles) {
      proms.push(EgoCar.initLoadModel(key));
    }
    return Promise.allSettled(proms);
  }

  static async initLoadModel(type: EgoCarType) {
    try {
      const modelFile = EgoCar.modelFiles[type];
      if (modelFile) {
        const gltf = await gltfLoader.loadAsync(modelFile);
        const model = gltf.scene;
        EgoCar.cacheModels[type] = model;
        return model;
      }
      return Promise.reject(`not find type: ${type}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { position, rotation } = modelData;
    model.position.set(position.x, position.y, position.z);
    model.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  update(data: UpdateData) {
    if (!data.data.length) return;
    data.data.forEach((item) => {
      const model = this.modelList.get(EgoCarTypeEnum.EGO_CAR);
      if (model) {
        this.setModelAttributes(model, item);
      } else if (EgoCar.cacheModels[EgoCarTypeEnum.EGO_CAR]) {
        const newModel = EgoCar.cacheModels[EgoCarTypeEnum.EGO_CAR];
        this.setModelAttributes(newModel, item);
        // this.scene.add(newModel);
        this.modelList.set(EgoCarTypeEnum.EGO_CAR, newModel);
      }
    });
  }
}
