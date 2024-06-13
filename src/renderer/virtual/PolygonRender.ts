import { Group, Mesh, MeshLambertMaterial, type Object3D } from "three";

import Target from "@/renderer/target";
import { createGeometry } from "@/renderer/utils";

interface DataType {
  color: { r: number; g: number; b: number };
  contour: { x: number; y: number }[];
  height: number;
  id: number;
  show_id: boolean;
  type: number;
}

interface UpdateData {
  data: DataType[];
  defaultEnable: boolean;
  group: string;
  style: Record<string, any>;
  timestamp_nsec: number;
  topic: string;
  type: "polygon";
}

const polygonMaterial = new MeshLambertMaterial({
  transparent: true,
  opacity: 0.8
});

export default class PolygonRender extends Target {
  topic = ["perception_fusion_polygon"];

  createModel(modelData: DataType) {
    const { id, contour, color, height, show_id } = modelData;
    const geometry = createGeometry(contour, height);
    const material = polygonMaterial.clone() as MeshLambertMaterial;
    material.color.setRGB(color.r, color.g, color.b);
    const polygonMesh = new Mesh(geometry, material);
    const group = new Group();
    group.add(polygonMesh);

    // if (show_id) {
    //   const textMesh = this.createText(polygonData);
    //   group.add(textMesh);
    // }
    return group;
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { id, contour, color, height, show_id } = modelData;
    const polygonMesh = model.children[0] as Mesh;
    const geometry = createGeometry(contour, height);
    polygonMesh.geometry.dispose();
    polygonMesh.geometry = geometry;
    const material = polygonMesh.material as MeshLambertMaterial;
    material.color.setRGB(color.r, color.g, color.b);
    // if (show_id) {
    //   const textMesh =
    //     (model.children[1] as Mesh) || this.createText(modelData);
    //   const position = this.getPolygonPosition(contour);
    //   textMesh.position.set(position.x, position.y, height + textOffsetZ);
    //   const textmaterial = textMesh.material as THREE.MeshBasicMaterial;
    //   textmaterial.color.setRGB(color.r, color.g, color.b);
    // }
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
