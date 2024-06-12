import {
  BoxGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshLambertMaterial,
  type Object3D
} from "three";

import { Target } from "../BasicTarget";

interface TargetData {
  color: { r: number; g: number; b: number };
  extra_info: string[];
  height: number;
  id: number;
  length: number;
  type: number;
  width: number;
  x: number;
  y: number;
  yaw: number; // 偏转角
}

interface PolygonData {
  color: { r: number; g: number; b: number };
  contour: {
    x: number;
    y: number;
  }[];
  height: number;
  id: number;
  show_id: boolean;
  type: number;
}

interface BoxData {
  arrow_array: {
    data: any[];
    defaultEnable: boolean;
    group: string;
    style: Record<string, any>;
    timestamp_nsec: number;
    topic: string;
    type: "arrow";
  };
  box_target_array: {
    data: TargetData[];
    defaultEnable: boolean;
    group: string;
    style: Record<string, any>;
    timestamp_nsec: number;
    topic: string;
    type: "target";
  };
  polygon_array: {
    data: PolygonData[];
    defaultEnable: boolean;
    group: string;
    style: Record<string, any>;
    timestamp_nsec: number;
    topic: string;
    type: "polygon";
  };
}

const boxMaterial = new MeshLambertMaterial();
const boxGeometry = new BoxGeometry(1, 1, 1);
const boxMesh = new Mesh(boxGeometry, boxMaterial);

const edgesMaterial = new LineBasicMaterial();
const edgesMesh = new LineSegments(
  new EdgesGeometry(boxGeometry),
  edgesMaterial
);

export default class BoxTargetRender extends Target {
  topic = [
    "perception_radar_front",
    "perception_obstacle_fusion",
    "perception_fusion /perception/fusion/object",
    "perception_camera_front",
    "perception_camera_nv"
  ];

  createBox(modelData: TargetData) {
    const { id, color, type } = modelData;
    const group = new Group();
    const boxMeshNew = boxMesh.clone();
    boxMeshNew.material = boxMaterial.clone();
    const boxMeshMaterial = boxMeshNew.material as MeshLambertMaterial;
    boxMeshMaterial.transparent = true;
    boxMeshMaterial.opacity = !type ? 0.8 : 0.15;
    boxMeshMaterial.color.setRGB(color.r, color.g, color.b);
    boxMeshNew.userData.type = "box";
    boxMeshNew.userData.objectId = id;

    const edgesMeshNew = edgesMesh.clone() as LineSegments;
    edgesMeshNew.material = edgesMaterial.clone();
    const edgesMeshMaterial = edgesMeshNew.material as LineBasicMaterial;
    edgesMeshMaterial.color.setRGB(color.r, color.g, color.b);
    edgesMeshNew.userData.type = "edges";
    edgesMeshNew.userData.objectId = id;
    group.add(boxMeshNew, edgesMeshNew);
    return group;
  }

  setBoxAttributes(model: Object3D, modelData: TargetData) {
    const { yaw, x, y, length, width, height, color } = modelData;
    model.rotation.z = yaw;
    model.position.set(x, y, height / 2);

    const boxMeshNew = model.children[0] as Mesh;
    const edgesMeshNew = model.children[1] as Mesh;

    boxMeshNew.scale.set(length, width, height || 0.1);
    edgesMeshNew.scale.set(length, width, height || 0.1);

    const boxMeshMaterial = boxMeshNew.material as MeshLambertMaterial;
    boxMeshMaterial.color.setRGB(color.r, color.g, color.b);
    const edgesMeshMaterial = edgesMeshNew.material as LineBasicMaterial;
    edgesMeshMaterial.color.setRGB(color.r, color.g, color.b);
  }

  update(data: BoxData) {
    if (!data) {
      this.clear();
      return;
    }
    data.box_target_array.data.forEach((modelData) => {
      const { id } = modelData;
      const model = this.modelList[id];
      if (model) {
        this.setBoxAttributes(model, modelData);
      } else {
        const newModel = this.createBox(modelData);
        this.setBoxAttributes(newModel, modelData);
        this.scene.add(newModel);
        this.modelList[id] = newModel;
      }
    });
    this.checkModelByData(data.box_target_array.data);
  }
}
