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

import Target from "@/renderer/target";
import type { UpdateDataTool } from "@/typings";
import DepthContainer from "@/utils/three/depthTester";

interface DataType {
  color: { r: number; g: number; b: number; a: number };
  contour: Vector2[];
  holes: Vector2[][];
  z: number;

  id?: number;
  x?: number;
  y?: number;
  yaw?: number;
  pitch?: number;
  roll?: number;
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "freespace";
}

export default class Freespace extends Target {
  update(data: UpdateData) {
    this.clear();
    const length = data.data.length;
    if (!length) return;
    data.data.forEach((item, index) => {
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
      mesh.renderOrder = this.renderOrder;
      mesh.position.set(
        x,
        y,
        DepthContainer.getIndexDepth(this.renderOrder, index, length)
      );
      mesh.rotation.set(
        roll * MathUtils.DEG2RAD,
        pitch * MathUtils.DEG2RAD,
        yaw * MathUtils.DEG2RAD
      );
      this.modelList.set(id || mesh.uuid, mesh);
      this.scene.add(mesh);
    });
  }
}
