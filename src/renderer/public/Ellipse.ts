import { Mesh, MeshBasicMaterial, Shape, ShapeGeometry } from "three";

import type { UpdateDataTool } from "@/typings";

import Target from "../target";

interface DataType {
  ellipse: {
    x: number;
    y: number;
    z: number;
    radius_x: number;
    radius_y: number;
    start_angle: number;
  };
  color: { r: number; g: number; b: number; a?: number };
  opacity: number;
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "ellipse";
}

const materialCache = new MeshBasicMaterial({ transparent: true });

export default class Ellipse extends Target {
  update(data: UpdateData) {
    this.clear();
    if (!data.data.length) return;
    data.data.forEach((item) => {
      const { x, y, radius_x, radius_y, start_angle } = item.ellipse;
      const shape = new Shape();
      shape.ellipse(
        x,
        y,
        radius_x,
        radius_y,
        0,
        2 * Math.PI,
        false,
        start_angle
      );
      const geometry = new ShapeGeometry(shape, 6);
      const material = materialCache.clone();
      material.color.setRGB(item.color.r, item.color.g, item.color.b);
      material.opacity = item.opacity;
      const mesh = new Mesh(geometry, material);
      mesh.position.z = item.ellipse.z;
      this.modelList.set(mesh.uuid, mesh);
      this.scene.add(mesh);
    });
  }
}
