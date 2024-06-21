import { Color, Mesh, ShaderMaterial } from "three";

import Target from "@/renderer/target";
import type { UpdateDataTool } from "@/typings";
import DepthContainer from "@/utils/three/depthTester";
import Line2D from "@/utils/three/objects/Line";
import {
  CustomizedShader,
  DashedShader,
  DoubleShader,
  SolidShader
} from "@/utils/three/objects/Line/shader";

interface DataType {
  color: { r: number; g: number; b: number };
  lineType: number;
  width: number;
}

interface PointData {
  color: { r: number; g: number; b: number; a: number };
  colorEnable: boolean;
  x: number;
  y: number;
}

interface JSONDataType extends DataType {
  polyline: PointData[];
}

interface BufferDataType extends DataType {
  point: PointData[];
}

interface JSONData extends UpdateDataTool<JSONDataType[]> {
  type: "polyline";
}

interface BufferData extends UpdateDataTool<BufferDataType[]> {
  type: "polyline";
}

export type UpdateData = JSONData | BufferData;

export default class Line extends Target {
  depth = DepthContainer.getDepth(3);

  update(data: UpdateData) {
    this.clear();
    const length = data.data.length;
    if (!length) return;
    data.data.forEach((item, index) => {
      let point: PointData[] = [];
      if ("polyline" in item) {
        point = item.polyline;
      } else {
        point = item.point;
      }
      if (!point.length) return;
      let draw_solid_line = true;
      let draw_gradient_line = true;
      switch (item.lineType) {
        case 0:
          draw_solid_line = true;
          draw_gradient_line = true;
          break;
        case 1:
          draw_solid_line = true;
          draw_gradient_line = false;
          break;
        case 2:
          draw_solid_line = false;
          draw_gradient_line = true;
          break;
        default:
          draw_solid_line = true;
          draw_gradient_line = false;
          break;
      }
      if (draw_gradient_line) {
        const geometry = new Line2D(
          point.map((line) => [
            line.x,
            line.y,
            line.color.r,
            line.color.g,
            line.color.b,
            line.color.a
          ]),
          { distances: false, closed: false, ratio: true }
        );
        const material = CustomizedShader({
          thickness: item.width
        });
        const mesh = new Mesh(geometry, material);
        mesh.position.z = this.depth + index * 0.005 + 0.03;
        mesh.renderOrder = mesh.position.z;
        mesh.visible = this.enable;
        this.modelList.set(mesh.uuid, mesh);
        this.scene.add(mesh);
      }
      if (draw_solid_line) {
        const line_style = getPolylineStyle(
          item.lineType,
          item.color,
          item.width
        );
        const geometry = new Line2D(
          point.map((line) => [line.x, line.y]),
          {
            distances: line_style.distance,
            closed: false
          }
        );
        const mesh = new Mesh(geometry, line_style.mat);
        mesh.position.z = this.depth + index * 0.0005 - 0.001;
        mesh.renderOrder = mesh.position.z;
        mesh.visible = this.enable;
        this.modelList.set(mesh.uuid, mesh);
        this.scene.add(mesh);
      }
    });
  }

  dispose(): void {
    DepthContainer.delete(this.depth, 3);
    super.dispose();
  }
}

type ColorType = {
  r: number;
  g: number;
  b: number;
};

// 0:上渐变色下单色双实线(上下双层线) ,1: 单色实线 ,2: 渐变色实线 ,3: 单色虚线, 4: 单色实线,5: 双虚线,6: 双实线,7: 左虚右实线, 8:左实右虚线
function getPolylineStyle(type: number, color: ColorType, width: number) {
  const style: { mat: ShaderMaterial; distance: boolean } = {
    mat: new ShaderMaterial(),
    distance: false
  };

  // 默认均为实线
  let left_dash = 1,
    right_dash = 1;
  const default_color = new Color(color.r, color.g, color.b);
  if (type === 5 || type === 7) {
    left_dash = 0; // 左线为虚线
  }

  if (type === 5 || type === 8) {
    right_dash = 0; // 右线为虚线
  }

  switch (type) {
    case 0:
    case 1:
    case 4:
      style.mat = SolidShader({
        diffuse: default_color,
        thickness: width,
        opacity: 0.8
      });
      style.distance = false;
      break;
    case 3:
      style.mat = DashedShader({
        diffuse: default_color,
        thickness: width,
        opacity: 0.8
      });
      style.distance = true;
      break;
    case 5:
    case 6:
    case 7:
    case 8:
    default:
      style.mat = DoubleShader({
        diffuse: default_color,
        thickness: width,
        leftDashed: left_dash,
        rightDashed: right_dash,
        opacity: 0.8
      });
      style.distance = true;
  }
  return style;
}
