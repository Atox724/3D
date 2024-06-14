import type { Scene } from "three";

import { Line, type LineUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = [
  "dpc_planning_debug_info",
  "perception_camera_roadlines center_camera_fov30",
  "perception_camera_roadlines center_camera_fov120",
  "perception_camera_roadlines nv_cameras",
  "localmap_center_line",
  "localmap_lane_line",
  "localmap_stop_line",
  "dpc_lfp_planning_trajectory",
  "memdrive_ref_route_trajectory",
  "dpc_lfp_planning_planline",
  "dpc_planning_otherline",
  "dpc_planning_reference_line",
  "dpc_planning_edgeline",
  "localmap_speedbump"
] as const;
type TopicType = (typeof topic)[number];

type PolylineData1 = { polyline_array: LineUpdateData };
type PolylineData2 = { polyline: LineUpdateData };
type PolylineData3 = LineUpdateData;
type PolylineData = PolylineData1 | PolylineData2 | PolylineData3;

interface PolylineUpdateDataMap extends Record<TopicType, PolylineData> {
  dpc_planning_debug_info: PolylineData1;
  "perception_camera_roadlines center_camera_fov30": PolylineData2;
  "perception_camera_roadlines center_camera_fov120": PolylineData2;
  "perception_camera_roadlines nv_cameras": PolylineData2;
  localmap_center_line: PolylineData3;
  localmap_lane_line: PolylineData3;
  localmap_stop_line: PolylineData3;
  dpc_lfp_planning_trajectory: PolylineData3;
  memdrive_ref_route_trajectory: PolylineData3;
  dpc_lfp_planning_planline: PolylineData3;
  dpc_planning_otherline: PolylineData3;
  dpc_planning_reference_line: PolylineData3;
  dpc_planning_edgeline: PolylineData3;
  localmap_speedbump: PolylineData3;
}

type CreateRenderType1 = { polyline_array: Line };
type CreateRenderType2 = { polyline: Line };
type CreateRenderType3 = Line;
type CreateRenderType =
  | CreateRenderType1
  | CreateRenderType2
  | CreateRenderType3;

interface CreateRenderMap extends Record<TopicType, CreateRenderType> {
  dpc_planning_debug_info: CreateRenderType1;
  "perception_camera_roadlines center_camera_fov30": CreateRenderType2;
  "perception_camera_roadlines center_camera_fov120": CreateRenderType2;
  "perception_camera_roadlines nv_cameras": CreateRenderType2;
  localmap_center_line: CreateRenderType3;
  localmap_lane_line: CreateRenderType3;
  localmap_stop_line: CreateRenderType3;
  dpc_lfp_planning_trajectory: CreateRenderType3;
  memdrive_ref_route_trajectory: CreateRenderType3;
  dpc_lfp_planning_planline: CreateRenderType3;
  dpc_planning_otherline: CreateRenderType3;
  dpc_planning_reference_line: CreateRenderType3;
  dpc_planning_edgeline: CreateRenderType3;
  localmap_speedbump: CreateRenderType3;
}

export default class PolylineRender extends Target {
  topic: readonly string[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      dpc_planning_debug_info: {
        polyline_array: new Line(scene)
      },
      "perception_camera_roadlines center_camera_fov30": {
        polyline: new Line(scene)
      },
      "perception_camera_roadlines center_camera_fov120": {
        polyline: new Line(scene)
      },
      "perception_camera_roadlines nv_cameras": {
        polyline: new Line(scene)
      },
      localmap_center_line: new Line(scene),
      localmap_lane_line: new Line(scene),
      localmap_stop_line: new Line(scene),
      dpc_lfp_planning_trajectory: new Line(scene),
      memdrive_ref_route_trajectory: new Line(scene),
      dpc_lfp_planning_planline: new Line(scene),
      dpc_planning_otherline: new Line(scene),
      dpc_planning_reference_line: new Line(scene),
      dpc_planning_edgeline: new Line(scene),
      localmap_speedbump: new Line(scene)
    };
  }

  update<T extends TopicType>(data: PolylineUpdateDataMap[T], topic: T) {
    if ("polyline_array" in data) {
      (this.createRender[topic] as CreateRenderType1).polyline_array.update(
        data.polyline_array
      );
    } else if ("polyline" in data) {
      (this.createRender[topic] as CreateRenderType2).polyline.update(
        data.polyline
      );
    } else {
      (this.createRender[topic] as CreateRenderType3).update(data);
    }
  }
}
