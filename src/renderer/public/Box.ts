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

import { TARGET_ZINDEX } from "@/constants";
import Target from "@/renderer/target";
import type { UpdateDataTool } from "@/typings";

interface DataType {
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

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "target";
}

const boxMaterial = new MeshLambertMaterial();
const boxGeometry = new BoxGeometry(1, 1, 1);
const boxMesh = new Mesh(boxGeometry, boxMaterial);

const edgesMaterial = new LineBasicMaterial();
const edgesMesh = new LineSegments(
  new EdgesGeometry(boxGeometry),
  edgesMaterial
);

export default class Box extends Target {
  topic: readonly string[] = [
    "dpc_planning_debug_info",
    "perception_obstacle_fusion",
    "perception_fusion /perception/fusion/object",
    "perception_radar_front",
    "perception_camera_front",
    "perception_camera_nv"
  ];

  createModel(modelData: DataType) {
    const { color, type } = modelData;
    const group = new Group();

    const boxMeshMaterial = boxMaterial.clone();
    boxMeshMaterial.transparent = true;
    boxMeshMaterial.opacity = !type ? 0.8 : 0.15;
    boxMeshMaterial.color.setRGB(color.r, color.g, color.b);

    const boxMeshNew = boxMesh.clone();
    boxMeshNew.material = boxMeshMaterial;
    boxMeshNew.name = "box";

    const edgesMeshMaterial = edgesMaterial.clone();
    edgesMeshMaterial.color.setRGB(color.r, color.g, color.b);

    const edgesMeshNew = edgesMesh.clone();
    edgesMeshNew.material = edgesMeshMaterial;
    edgesMeshNew.name = "edges";
    group.add(boxMeshNew, edgesMeshNew);
    return group;
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { yaw, x, y, length, width, height, color } = modelData;
    model.rotation.z = yaw;
    model.position.set(x, y, height / 2 + TARGET_ZINDEX.TARGET);

    const boxMeshNew = model.getObjectByName("box");
    if (boxMeshNew instanceof Mesh) {
      boxMeshNew.scale.set(length, width, height);
      boxMeshNew.material.color.setRGB(color.r, color.g, color.b);
    }
    const edgesMeshNew = model.getObjectByName("edges");
    if (edgesMeshNew instanceof LineSegments) {
      edgesMeshNew.scale.set(length, width, height);
      edgesMeshNew.material.color.setRGB(color.r, color.g, color.b);
    }
  }

  update(data: UpdateData) {
    if (!data.data.length) {
      this.clear();
      return;
    }
    data.data.forEach((modelData) => {
      const { id } = modelData;
      const model = this.modelList.get(id);
      if (model) {
        this.setModelAttributes(model, modelData);
      } else {
        const newModel = this.createModel(modelData);
        this.setModelAttributes(newModel, modelData);
        this.scene.add(newModel);
        this.modelList.set(id, newModel);
      }
    });
    this.checkModelByData(data.data);
  }
}
