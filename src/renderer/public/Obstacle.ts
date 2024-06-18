import type { Object3D, Vector3 } from "three";

import {
  AntiCollisionBarrel,
  AntiCollisionColumn,
  ConicalBarrel,
  SpeedBump,
  Tripod,
  WarningSign,
  WaterBarrierYellow
} from "@/assets/model";
import Target from "@/renderer/target";
import type { UpdateDataTool } from "@/typings";
import gltfLoader from "@/utils/three/gltfLoader";

// 障碍物与交通提示物
enum ObstacleTypeEnum {
  OBSTACLE_ISOLATION_BARREL = 294, // 障碍物隔离桶   2 隔离桶
  // OBSTACLE_BARRIER = 295, // 路栏  5
  OBSTACLE_CONE = 296, // 路锥   0 锥形桶
  OBSTACLE_POLE = 297, // 交通杆 1  隔离柱
  OBSTACLE_WARNING_TRIANGLE = 298, // 警告三角   3 三角标
  OBSTACLE_WaterBarrier = 295, // 4  水马
  OBSTACLE_CONSTRUCTION_ZONE_DIVERSION = 300, // 6 施工区导流标志
  OBSTACLE_OTHER_DIVERSION = 301, // 7 施工区导流标志
  OBSTACLE_SPEED_BUMP = 302 //  减速带
}
type ObstacleType = keyof typeof ObstacleTypeEnum;

interface ObstacleData {
  id: number;
  type: number; // 元素类型
  position: Vector3; // 模型中心位置
  rotation: Vector3; // 模型偏转值
}
export interface UpdateData extends UpdateDataTool<ObstacleData[]> {
  type: "obstacleModel";
}

export default class Obstacle extends Target {
  static cacheModels = {} as Record<ObstacleType, Object3D>;
  static modelFiles: Record<ObstacleType, string> = {
    OBSTACLE_ISOLATION_BARREL: AntiCollisionBarrel, // 防撞桶 隔离桶
    OBSTACLE_CONE: ConicalBarrel, // 路锥,锥形桶
    OBSTACLE_POLE: AntiCollisionColumn, // 交通杆,隔离柱
    OBSTACLE_WARNING_TRIANGLE: Tripod, // 警告三角 三角标
    OBSTACLE_WaterBarrier: WaterBarrierYellow, // 水马
    OBSTACLE_CONSTRUCTION_ZONE_DIVERSION: WarningSign, // 施工区导流标志
    OBSTACLE_OTHER_DIVERSION: WarningSign, // 施工区导流标志
    OBSTACLE_SPEED_BUMP: SpeedBump
  };

  static preloading() {
    const proms = [];
    let key: keyof typeof Obstacle.modelFiles;
    for (key in Obstacle.modelFiles) {
      proms.push(Obstacle.initLoadModel(key));
    }
    return Promise.allSettled(proms);
  }

  static async initLoadModel(type: ObstacleType) {
    try {
      const modelFile = Obstacle.modelFiles[type];
      if (modelFile) {
        const gltf = await gltfLoader.loadAsync(modelFile);
        const model = gltf.scene;
        Obstacle.cacheModels[type] = model;
        return model;
      }
      return Promise.reject(`not find type: ${type}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  setModelAttributes(model: Object3D, modelData: ObstacleData) {
    const { position, rotation } = modelData;
    model.position.set(position.x, position.y, position.z);
    model.rotation.set(rotation.x, rotation.y, rotation.z);
    model.visible = this.enable;
  }

  update(data: UpdateData) {
    if (!data.data.length) {
      this.clear();
      return;
    }
    data.data.forEach((modelData) => {
      const { id, type } = modelData;
      const model = this.modelList.get(id);
      const typeName = ObstacleTypeEnum[type] as ObstacleType;
      if (model) {
        this.setModelAttributes(model, modelData);
      } else if (Obstacle.cacheModels[typeName]) {
        const newModel = Obstacle.cacheModels[typeName].clone();
        this.setModelAttributes(newModel, modelData);
        this.scene.add(newModel);
        this.modelList.set(id, newModel);
      }
    });
    this.checkModelByData(data.data);
  }
}
