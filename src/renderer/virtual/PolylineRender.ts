import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP } from "@/constants";
import { Line, type LineUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = VIRTUAL_RENDER_MAP.polyline;
type TopicType = (typeof topic)[number];

type PolylineUpdateDataMap = {
  [key in TopicType]:
    | { polyline: LineUpdateData }
    | { polyline_array: LineUpdateData }
    | LineUpdateData;
};

type CreateRenderMap = {
  [key in TopicType]: { polyline_array: Line } | { polyline: Line } | Line;
};
export default class PolylineRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    const createPolyLine = () => ({ polyline: new Line(scene) });
    const createPolyLineArray = () => ({ polyline_array: new Line(scene) });

    this.createRender = {
      "perception_camera_roadlines center_camera_fov30": createPolyLine(),
      "perception_camera_roadlines center_camera_fov120": createPolyLine(),
      "perception_camera_roadlines nv_cameras": createPolyLine(),
      dpc_planning_debug_info: createPolyLineArray(),
      dpc_planning_otherline: new Line(scene),
      dpc_planning_reference_line: new Line(scene),
      dpc_planning_edgeline: new Line(scene),
      dpc_lfp_planning_trajectory: new Line(scene),
      dpc_lfp_planning_planline: new Line(scene),
      localmap_center_line: new Line(scene),
      localmap_lane_line: new Line(scene),
      localmap_stop_line: new Line(scene),
      localmap_speedbump: new Line(scene),
      memdrive_ref_route_trajectory: new Line(scene)
    };
  }

  update<T extends TopicType>(data: PolylineUpdateDataMap[T], topic: T) {
    const renderItem = this.createRender[topic];

    if ("polyline_array" in renderItem && "polyline_array" in data) {
      renderItem.polyline_array.update(data.polyline_array);
    } else if ("polyline" in renderItem && "polyline" in data) {
      renderItem.polyline.update(data.polyline);
    } else if (
      !("polyline_array" in renderItem) &&
      !("polyline" in renderItem) &&
      !("polyline" in data) &&
      !("polyline_array" in data)
    ) {
      renderItem.update(data);
    } else {
      console.error(`[PolylineRender] topic: ${topic} is not match with data`);
    }
  }
}
