import { ArrowHelper, Color, Vector3 } from "three";

import { RENDER_ORDER } from "@/constants";
import Target from "@/renderer/target";
import type { UpdateDataTool } from "@/typings";
import DepthContainer from "@/utils/three/depthTester";

interface DataType {
  id?: string;
  color: { r: number; g: number; b: number };
  end_point: { x: number; y: number; z: number };
  origin: { x: number; y: number; z: number };
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "arrow";
}

export default class Arrow extends Target {
  topic = [];

  update(data: UpdateData) {
    this.clear();
    if (!data.data.length) return;
    data.data.forEach((modelData) => {
      const { origin: o, end_point, color: c } = modelData;
      const origin = new Vector3(o.x, o.y, o.z);
      const end = new Vector3(end_point.x, end_point.y, end_point.z);
      // 计算方向向量
      const sub = new Vector3().subVectors(end, origin);
      const length = sub.length();
      const dir = sub.normalize();
      const color = new Color(c.r, c.g, c.b);
      const arrow = new ArrowHelper(dir, origin, length, color);
      arrow.position.set(
        origin.x,
        origin.y,
        Math.max(origin.z, DepthContainer.getDepth(RENDER_ORDER.ARROW))
      );
      this.modelList.set(arrow.uuid, arrow);
      this.scene.add(arrow);
    });
  }
}
