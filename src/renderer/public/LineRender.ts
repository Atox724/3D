import { Mesh, ShaderMaterial } from "three";

import { TARGET_ZINDEX } from "@/constants";
import Target from "@/renderer/target";
import GradientLine from "@/utils/three/gradientLine";
import Line from "@/utils/three/line";
import {
  CustomizedShader,
  DashedShader,
  DoubleShader,
  SolidShader
} from "@/utils/three/shader";

interface DataType {
  color: { r: number; g: number; b: number };
  lineType: number;
  polyline: {
    color: { r: number; g: number; b: number; a: number };
    colorEnable: boolean;
    x: number;
    y: number;
  }[];
  width: number;
}

interface UpdateData {
  data: DataType[];
  defaultEnable: boolean;
  group: string;
  style: Record<string, any>;
  timestamp_nsec: number;
  topic: string;
  type: "polyline";
}

export default class LineRender extends Target {
  topic: string[] = [];

  update(data: UpdateData) {
    this.clear();

    if (!data.data.length) return;
    data.data.forEach((item) => {
      let draw_solid_line = true;
      let draw_gradient_line = false;
      switch (item.lineType) {
        case 0:
          draw_solid_line = true;
          draw_gradient_line = true;
          break;
        case 1:
          draw_gradient_line = false;
          break;
        case 2:
          draw_solid_line = false;
          break;
        default:
          draw_solid_line = true;
          draw_gradient_line = false;
          break;
      }
      if (draw_gradient_line) {
        const color_trajectory_geometry = new GradientLine(
          item.polyline.map((line) => [
            line.x,
            line.y,
            line.color.r,
            line.color.g,
            line.color.b,
            line.color.a
          ]),
          { distances: false, closed: false, ratio: true }
        );
        const gradient_line_mat = CustomizedShader({
          thickness: item.width,
          vertexColors: 2
        });
        const color_trajectory_obj = new Mesh(
          color_trajectory_geometry,
          gradient_line_mat
        );
        color_trajectory_obj.position.z = TARGET_ZINDEX.LANELINE;
        this.modelList.set(color_trajectory_obj.uuid, color_trajectory_obj);
        this.scene.add(color_trajectory_obj);
      }
      if (draw_solid_line) {
        const line_style = getPolylineStyle(
          item.lineType,
          item.color,
          item.width
        );
        const base_trajectory_geometry = new Line(
          item.polyline.map((line) => [line.x, line.y]),
          {
            distances: line_style.distance,
            closed: false
          }
        );
        const solid_trajectory_obj = new Mesh(
          base_trajectory_geometry,
          line_style.mat
        );
        solid_trajectory_obj.position.z = TARGET_ZINDEX.LANELINE;
        this.modelList.set(solid_trajectory_obj.uuid, solid_trajectory_obj);
        this.scene.add(solid_trajectory_obj);
      }
    });
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
  const default_color = 0x39ebeb;
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
        thickness: 0.15,
        leftDashed: left_dash,
        rightDashed: right_dash,
        opacity: 0.8
      });
      style.distance = true;
  }

  style.mat.uniforms.diffuse.value.r = color.r;
  style.mat.uniforms.diffuse.value.g = color.g;
  style.mat.uniforms.diffuse.value.b = color.b;
  return style;
}
