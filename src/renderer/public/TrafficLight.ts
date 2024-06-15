import type { Object3D, Vector3 } from "three";

import {
  TrafficLight1,
  TrafficLight2Horizontal,
  TrafficLight2Vertical,
  TrafficLight3Horizontal,
  TrafficLight3Vertical
} from "@/assets/model";
import Target from "@/renderer/target";
import type { UpdateDataTool } from "@/typings";
import gltfLoader from "@/utils/three/gltfLoader";

enum TrafficLightTypeEnum {
  TrafficLight1 = 1, // 一灯红绿灯
  TrafficLight2Vertical = 2, // 二灯红绿灯
  TrafficLight3Vertical = 3, // 三灯红绿灯
  TrafficLight2Horizontal = 4, // 二灯横向红绿灯
  TrafficLight3Horizontal = 5 // 三灯横向红绿灯
}
type TrafficLightType = keyof typeof TrafficLightTypeEnum;

interface TrafficLightData {
  id: number;
  type: number; // 元素类型
  position: Vector3; // 模型中心位置
  rotation: Vector3; // 模型偏转值
}

export interface UpdateData extends UpdateDataTool<TrafficLightData[]> {
  type: "trafficLightModel";
}

export default class TrafficLight extends Target {
  topic = [];

  static modelFiles: Record<TrafficLightType, string> = {
    TrafficLight1: TrafficLight1,
    TrafficLight2Vertical: TrafficLight2Vertical,
    TrafficLight3Vertical: TrafficLight3Vertical,
    TrafficLight2Horizontal: TrafficLight2Horizontal,
    TrafficLight3Horizontal: TrafficLight3Horizontal
  };

  static cacheModels = {} as Record<TrafficLightType, Object3D>;
  static preloading() {
    const proms = [];
    let key: keyof typeof TrafficLight.modelFiles;
    for (key in TrafficLight.modelFiles) {
      proms.push(TrafficLight.initLoadModel(key));
    }
    return Promise.allSettled(proms);
  }

  static async initLoadModel(type: TrafficLightType) {
    try {
      const modelFile = TrafficLight.modelFiles[type];
      if (modelFile) {
        const gltf = await gltfLoader.loadAsync(modelFile);
        const model = gltf.scene;
        TrafficLight.cacheModels[type] = model;
        return model;
      }
      return Promise.reject(`not find type: ${type}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  setModelAttributes(model: Object3D, modelData: TrafficLightData) {
    const { position, rotation } = modelData;
    model.position.set(position.x, position.y, position.z);
    model.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  update(data: UpdateData) {
    if (!data.data.length) {
      this.clear();
      return;
    }
    data.data.forEach((modelData) => {
      const { id, type } = modelData;
      const model = this.modelList.get(id);
      const typeName = TrafficLightTypeEnum[type] as TrafficLightType;
      if (model) {
        this.setModelAttributes(model, modelData);
      } else if (TrafficLight.cacheModels[typeName]) {
        const newModel = TrafficLight.cacheModels[typeName].clone();
        this.setModelAttributes(newModel, modelData);
        this.scene.add(newModel);
        this.modelList.set(id, newModel);
      }
    });
    this.checkModelByData(data.data);
  }
}
