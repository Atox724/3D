import { ArrowHelper, Color, Vector3 } from "three";

import { TARGET_ZINDEX } from "@/constants";
import Target from "@/renderer/target";
import type { UpdateDataTool } from "@/typings";

interface DataType {
  id?: string;
  color: { r: number; g: number; b: number };
  end_point: { x: number; y: number; z: number };
  origin: { x: number; y: number; z: number };
}

interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "arrow";
}

export default class ArrowRender extends Target {
  topic: readonly string[] = [];

  checkModelByData<D extends Array<any>>(data: D, list = this.modelList) {
    const cacheKeys = [...list.keys()];
    while (list.size > data.length) {
      const key = cacheKeys.pop();
      if (!key) break;
      const model = list.get(key);
      if (model) this.disposeObject(model);
      list.delete(key);
    }
  }

  update(data: UpdateData) {
    if (!data.data.length) {
      this.clear();
      return;
    }
    const listLength = this.modelList.size;
    data.data.forEach((modelData, index) => {
      const { origin: o, end_point, color: c } = modelData;
      const origin = new Vector3(o.x, o.y, o.z);
      const end = new Vector3(end_point.x, end_point.y, end_point.z);
      // 计算方向向量
      const sub = new Vector3().subVectors(end, origin);
      const length = sub.length();
      const dir = sub.normalize();
      const color = new Color(c.r, c.g, c.b);
      if (index < listLength) {
        const arrow = [...this.modelList.values()][index] as ArrowHelper;
        arrow.setLength(length);
        arrow.setDirection(dir);
        arrow.setColor(color);
        arrow.position.set(origin.x, origin.y, origin.z + TARGET_ZINDEX.TARGET);
      } else {
        const arrow = new ArrowHelper(dir, origin, length, color);
        arrow.position.set(origin.x, origin.y, origin.z + TARGET_ZINDEX.TARGET);
        modelData.id = arrow.uuid;
        this.modelList.set(arrow.uuid, arrow);
        this.scene.add(arrow);
      }
    });
    this.checkModelByData(data.data);
  }
}
