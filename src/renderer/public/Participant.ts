import {
  type AnimationClip,
  AnimationMixer,
  Color,
  Mesh,
  type Object3D,
  SkinnedMesh,
  type Vector3
} from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";

import {
  Animal,
  Bike,
  Bus,
  Man,
  Motorcycle,
  OtherCar,
  SUV,
  Tricycle,
  Truck
} from "@/assets/model";
import Target from "@/renderer/target";
import type { UpdateDataTool } from "@/typings";
import gltfLoader from "@/utils/three/gltfLoader";

enum ParticipantTypeEnum {
  // 交通参与者
  UNKNOWN = 0,
  PEDESTRIAN = 1, // 行人
  // VEHICLE = 2,
  VEHICLE_CAR = 3, // 轿车
  VEHICLE_SUV = 4, // SUV
  VEHICLE_VAN = 5,
  VEHICLE_TRUCK = 6, // 卡车
  VEHICLE_PICKUP_TRUCK = 7,
  VEHICLE_BUS = 8, // 公交车/巴士
  VEHICLE_TAXI = 9,
  VEHICLE_EMERGENCY = 10,
  VEHICLE_SCHOOL_BUS = 11,
  VEHICLE_UNKNOWN = 12,
  // VEHICLE_END = 13,
  // BIKE = 14,
  // NO_PERSON_VEHICLE = 15,
  BIKE_BICYCLE = 16, // 自行车
  // BIKE_BIKEBIG = 17,
  // BIKE_BIKESMALL = 18,
  VEHICLE_MPV = 20,
  ANIMAL_CAT = 21,
  ANIMAL_DOG = 22,
  ANIMAL_CATTLE = 23,
  ANIMAL_HORSE = 24,
  ANIMAL_SHEEP = 25,
  CYCLIST = 117,
  BIKE_MOTOR = 176
  // BIKE_END = 19,
  // Man = 0, // 行人
  // Bike = 1, // 自行车
  // Motorcycle = 2, // 摩托车
  // OtherCar = 3, // 轿车
  // SUV = 4, // SUV
  // Truck = 5, // 卡车
  // Bus = 6, // 公交车/巴士
}
type ParticipantType = keyof typeof ParticipantTypeEnum;

interface ParticipantData {
  id: number;
  type: number; // 元素类型
  position: Vector3; // 模型中心位置
  rotation: Vector3; // 模型偏转值
  vehicleLightStatus?: { brake: number; lampSignal: number };
  doorObject?: {
    leftFront: boolean;
    rightFront?: boolean;
    leftRear?: boolean;
    rightRear?: boolean;
    trunkLeft?: boolean;
    trunkRight?: boolean;
    trunkUp?: boolean;
  };
  color?: string;
  sizeinfo?: Vector3;
}

export interface UpdateData extends UpdateDataTool<ParticipantData[]> {
  type: "participantModel";
}

export default class Participant extends Target {
  topic = [];

  static cacheModels = {} as Record<ParticipantType, Object3D>;
  static modelFiles: Record<ParticipantType, string> = {
    PEDESTRIAN: Man,
    VEHICLE_CAR: OtherCar,
    VEHICLE_SUV: SUV,
    VEHICLE_MPV: SUV,
    ANIMAL_CAT: Animal,
    ANIMAL_DOG: Animal,
    ANIMAL_CATTLE: Animal,
    ANIMAL_HORSE: Animal,
    ANIMAL_SHEEP: Animal,
    VEHICLE_TRUCK: Truck,
    VEHICLE_BUS: Bus,
    VEHICLE_UNKNOWN: OtherCar,
    BIKE_BICYCLE: Bike,
    CYCLIST: Tricycle,
    BIKE_MOTOR: Motorcycle,

    UNKNOWN: "",
    VEHICLE_VAN: "",
    VEHICLE_PICKUP_TRUCK: "",
    VEHICLE_TAXI: "",
    VEHICLE_EMERGENCY: "",
    VEHICLE_SCHOOL_BUS: ""
  };
  static animationsList: Record<string, AnimationClip[]> = {};
  static colorList = ["#a7a7a7", "#13c2c2", "#faad14", "#ff0000"];

  static preloading() {
    const proms = [];
    let key: keyof typeof Participant.modelFiles;
    for (key in Participant.modelFiles) {
      proms.push(Participant.initLoadModel(key));
    }
    return Promise.allSettled(proms);
  }

  static async initLoadModel(type: ParticipantType) {
    try {
      const modelFile = Participant.modelFiles[type];
      if (modelFile) {
        const gltf = await gltfLoader.loadAsync(modelFile);
        const model = gltf.scene;
        if (gltf.animations.length) {
          model.userData.animations = gltf.animations;
          Participant.animationsList[type] = gltf.animations;
        }
        model.userData.lightData = {};
        Participant.cacheModels[type] = model;
        return model;
      }
      return Promise.reject(`not find type: ${type}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  createModel(modelData: ParticipantData) {
    const { id, type } = modelData;
    let model: Object3D;
    const typeName = ParticipantTypeEnum[type] as ParticipantType;
    if (type === ParticipantTypeEnum.PEDESTRIAN) {
      model = clone(Participant.cacheModels.PEDESTRIAN);
      model.children[0].rotation.z = Math.PI;
      const mixer = new AnimationMixer(model);
      const action = mixer.clipAction(
        Participant.animationsList[ParticipantTypeEnum[type]][0]
      );
      action.play();
      if (!("mixers" in this.scene.userData)) {
        this.scene.userData.mixers = {};
      }
      this.scene.userData.mixers[typeName + id + "Mixer"] = mixer;
    } else {
      model = Participant.cacheModels[typeName].clone();
    }

    model.renderOrder = this.renderOrder;
    model.userData.type = typeName;
    model.userData.id = id;

    return model;
  }

  setModelAttributes(model: Object3D, modelData: ParticipantData) {
    const { position, rotation, color } = modelData;

    model.traverse((child) => {
      if (child instanceof Mesh || child instanceof SkinnedMesh) {
        child.material.color.set(new Color(color || Participant.colorList[0]));
      }
    });

    model.userData.color = color;

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
      const typeName = ParticipantTypeEnum[type] as ParticipantType;
      if (model) {
        if (model.userData.type !== ParticipantTypeEnum[type]) {
          this.disposeObject(model);
          const newModel = this.createModel(modelData);
          this.scene.add(newModel);
          this.modelList.set(id, newModel);
          this.setModelAttributes(newModel, modelData);
        } else {
          this.setModelAttributes(model, modelData);
        }
      } else if (Participant.cacheModels[typeName]) {
        const newModel = this.createModel(modelData);
        this.setModelAttributes(newModel, modelData);
        this.scene.add(newModel);
        this.modelList.set(id, newModel);
      }
    });
    this.checkModelByData(data.data);
  }
}
