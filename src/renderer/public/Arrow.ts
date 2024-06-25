import {
  ArrowHelper,
  Color,
  Object3D,
  type RGB,
  Vector3,
  type Vector3Like
} from "three";

import Target from "@/renderer/target";
import type { UpdateDataTool } from "@/typings";

interface DataType {
  id?: string;
  color: RGB;
  end_point: Vector3Like;
  origin: Vector3Like;
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "arrow";
}

export default class Arrow extends Target {
  createModel(modelData: DataType) {
    const { origin: o, end_point, color: c } = modelData;
    const origin = new Vector3().copy(o);
    const end = new Vector3().copy(end_point);
    // 计算方向向量
    const sub = new Vector3().subVectors(end, origin);
    const length = sub.length();
    const dir = sub.normalize();
    const color = new Color(c.r, c.g, c.b);
    const arrow = new ArrowHelper(dir, origin, length, color);
    return arrow;
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { origin, color } = modelData;
    const arrow = model as ArrowHelper;
    arrow.position.set(origin.x, origin.y, origin.z);
    arrow.setColor(new Color(color.r, color.g, color.b));
    arrow.visible = this.enable;
  }

  update(data: UpdateData) {
    this.clear();
    if (!data.data.length) return;
    data.data.forEach((modelData) => {
      const newModel = this.createModel(modelData);
      this.setModelAttributes(newModel, modelData);
      this.modelList.set(newModel.uuid, newModel);
      this.scene.add(newModel);
    });
  }
}
