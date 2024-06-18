import { DoubleSide, Mesh, MeshBasicMaterial, type Object3D } from "three";
import fontJSON from "three/examples/fonts/helvetiker_regular.typeface.json";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

import Target from "@/renderer/target";
import type { UpdateDataTool } from "@/typings";

interface DataType {
  fontSize: number;
  id: number;
  position: { x: number; y: number };
  text: string;
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "text_sprite";
}

// @ts-ignore
const font = new FontLoader().parse(fontJSON);

const textMaterial = new MeshBasicMaterial({
  color: "#cccccc",
  side: DoubleSide
});

export default class Text extends Target {
  createModel(modelData: DataType) {
    const { fontSize, text } = modelData;
    const geometry = new TextGeometry(text, {
      font: font,
      size: fontSize * 2,
      depth: 0
    });
    geometry.center();
    const material = textMaterial.clone();
    const model = new Mesh(geometry, material);
    model.rotation.z = -Math.PI / 2;
    return model;
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { position, fontSize } = modelData;
    model.position.set(position.x, position.y, 0);
    model.scale.setScalar(fontSize);
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
