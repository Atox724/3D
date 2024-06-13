import {
  Color,
  DoubleSide,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Path,
  Shape,
  ShapeGeometry,
  type Vector2
} from "three";

import { TARGET_ZINDEX } from "@/constants";
import Target from "@/renderer/target";

interface FreespaceData {
  id: number;
  contour: Vector2[];
  holes: Vector2[][];
  x?: number;
  y?: number;
  z: number;
  color: { r: number; g: number; b: number; a: number };
  yaw?: number;
  pitch?: number;
  roll?: number;
}

export default class FreespaceRender extends Target {
  topic = ["pilothmi_lane_line"];

  update(data: FreespaceData[]): void {
    this.clear();
    if (!data.length) return;
    data.forEach((item) => {
      const {
        id,
        x = 0,
        y = 0,
        color,
        yaw = 0,
        pitch = 0,
        roll = 0,
        contour = [],
        holes = []
      } = item;
      if (contour.length < 3) return;
      const shape = new Shape();
      shape.moveTo(contour[0].x, contour[0].y);
      contour.forEach((point) => {
        shape.lineTo(point.x, point.y);
      });
      holes.forEach((hole) => {
        if (hole.length < 3) return;
        const holePath = new Path();
        holePath.moveTo(hole[0].x, hole[0].y);
        hole.forEach((point) => {
          holePath.lineTo(point.x, point.y);
        });
        shape.holes.push(holePath);
      });
      const shapeGeometry = new ShapeGeometry(shape);
      const material = new MeshBasicMaterial({
        side: DoubleSide,
        transparent: true,
        color: new Color(color.r, color.g, color.b),
        opacity: color.a
      });
      const mesh = new Mesh(shapeGeometry, material);
      mesh.position.set(x, y, TARGET_ZINDEX.FREESPACE);
      mesh.rotation.set(
        roll * MathUtils.DEG2RAD,
        pitch * MathUtils.DEG2RAD,
        yaw * MathUtils.DEG2RAD
      );
      this.modelList[id] = mesh;
      this.scene.add(mesh);
    });
  }
}
