import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP, VIRTUAL_RENDER_ORDER } from "@/constants";
import { Line, type LineUpdateData } from "@/renderer/public";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topic = VIRTUAL_RENDER_MAP.polyline;
type TopicType = (typeof topic)[number];

type PolylineUpdateDataMap = {
  [key in TopicType]:
    | {
        topic: TopicType;
        data: { polyline: LineUpdateData };
      }
    | {
        topic: TopicType;
        data: { polyline_array: LineUpdateData };
      }
    | {
        topic: TopicType;
        data: LineUpdateData;
      };
};

type CreateRenderMap = {
  [key in TopicType]: { polyline_array: Line } | { polyline: Line } | Line;
};
export default class PolylineRender extends Render {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = VIRTUAL_RENDER_ORDER.LINE) {
    super();

    const createLine = () => new Line(scene, renderOrder);
    const createPolyLine = () => ({ polyline: new Line(scene, renderOrder) });
    const createPolyLineArray = () => ({
      polyline_array: new Line(scene, renderOrder)
    });

    this.createRender = {
      "perception_camera_roadlines center_camera_fov30": createPolyLine(),
      "perception_camera_roadlines center_camera_fov120": createPolyLine(),
      "perception_camera_roadlines nv_cameras": createPolyLine(),
      dpc_planning_debug_info: createPolyLineArray(),
      dpc_planning_otherline: createLine(),
      dpc_planning_reference_line: createLine(),
      dpc_planning_edgeline: createLine(),
      dpc_lfp_planning_trajectory: createLine(),
      dpc_lfp_planning_planline: createLine(),
      localmap_center_line: createLine(),
      localmap_lane_line: createLine(),
      localmap_stop_line: createLine(),
      localmap_speedbump: createLine(),
      memdrive_ref_route_trajectory: createLine()
    };

    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.on(topic, (data: PolylineUpdateDataMap[TopicType]) => {
        const renderItem = this.createRender[data.topic];

        if ("polyline_array" in renderItem && "polyline_array" in data.data) {
          renderItem.polyline_array.update(data.data.polyline_array);
        } else if ("polyline" in renderItem && "polyline" in data.data) {
          renderItem.polyline.update(data.data.polyline);
        } else if (
          !("polyline_array" in renderItem) &&
          !("polyline" in renderItem) &&
          !("polyline" in data.data) &&
          !("polyline_array" in data.data)
        ) {
          renderItem.update(data.data);
        } else {
          console.error(
            `[PolylineRender] topic: ${data.topic} is not match with data`
          );
        }
      });
    }
  }

  dispose(): void {
    for (const topic in this.createRender) {
      VIEW_WS.off(topic);
    }
    super.dispose();
  }
}
