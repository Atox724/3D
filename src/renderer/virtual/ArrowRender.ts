import { ArrowHelper, Color, LineBasicMaterial, Vector3 } from "three";

import Target from "@/renderer/target";

interface DataType {
  color: { r: number; g: number; b: number };
  end_point: { x: number; y: number; z: number };
  origin: { x: number; y: number; z: number };
}

interface UpdateData {
  data: DataType[];
  defaultEnable: boolean;
  group: string;
  style: Record<string, any>;
  timestamp_nsec: number;
  topic: string;
  type: "arrow";
}

export default class ArrowRender extends Target {
  topic = [
    "perception_obstacle_fusion_arrow",
    "perception_fusion_arrow",
    "perception_radar_front_arrow",
    "perception_camera_arrow"
  ];

  arrowCache: ArrowHelper[] = [];

  update(data: UpdateData) {
    if (!data.data.length) {
      // this.clear();
      this.arrowCache.forEach((model) => {
        this.scene.remove(model);
        this.disposeObject(model);
      });
      this.arrowCache = [];
      return;
    }
    const cacheLength = this.arrowCache.length;

    data.data.forEach((modelData, index) => {
      const { origin, end_point, color } = modelData;
      const direction = new Vector3(
        end_point.x - origin.x,
        end_point.y - origin.y,
        end_point.z - origin.z
      );
      if (index < cacheLength) {
        const arrow = this.arrowCache[index];
        arrow.setLength(direction.length());
        arrow.setDirection(direction.normalize());
        arrow.position.set(origin.x, origin.y, origin.z);
        arrow.setColor(new Color(color.r, color.g, color.b));
        const lineMaterial = arrow.line.material as LineBasicMaterial;
        lineMaterial.linewidth = 2.5;
      } else {
        const length = direction.length();
        const arrow = new ArrowHelper(
          direction.normalize(),
          new Vector3(origin.x, origin.y, origin.z),
          length,
          new Color(color.r, color.g, color.b)
        );
        const lineMaterial = arrow.line.material as LineBasicMaterial;
        lineMaterial.linewidth = 2.5;
        this.arrowCache.push(arrow);
        this.scene.add(arrow);
      }
    });
    if (cacheLength > data.data.length) {
      let count = 0;
      const arrowArrayLen = data.data.length;
      for (let i = arrowArrayLen; i < cacheLength; ++i) {
        this.scene.remove(this.arrowCache[i]);
        this.disposeObject(this.arrowCache[i]);
        ++count;
      }
      this.arrowCache.splice(arrowArrayLen, count);
    }
  }
}
