import { Mesh, ShaderMaterial } from "three";

import { TARGET_ZINDEX } from "@/constants";
import Target from "@/renderer/target";
import type { UpdateDataTool } from "@/typings";
import GradientLine from "@/utils/three/gradientLine";
import Line2D from "@/utils/three/line";
import {
  CustomizedShader,
  DashedShader,
  DoubleShader,
  SolidShader
} from "@/utils/three/shader";

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
  topic: readonly string[] = [
    "dpc_planning_debug_info",
    "perception_camera_roadlines center_camera_fov30",
    "perception_camera_roadlines center_camera_fov120",
    "perception_camera_roadlines nv_cameras",
    "localmap_center_line",
    "localmap_lane_line",
    "localmap_stop_line"
  ];

  update(data: UpdateData, _topic?: string) {
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
      let point: PointData[] = [];
      if ("polyline" in item) {
        point = item.polyline;
      } else {
        point = item.point;
      }
      if (draw_gradient_line) {
        const color_trajectory_geometry = new GradientLine(
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
        const base_trajectory_geometry = new Line2D(
          point.map((line) => [line.x, line.y]),
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
