import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP } from "@/constants";
import { Line, type LineUpdateData } from "@/renderer/public";
import type { ALLRenderType } from "@/typings";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topics = VIRTUAL_RENDER_MAP.polyline;
type TopicType = (typeof topics)[number];

type PolylineUpdateDataMap = {
  [key in TopicType]: key extends "dpc_planning_debug_info"
    ? { topic: key; data: { polyline_array: LineUpdateData } }
    : key extends
          | "perception_camera_roadlines center_camera_fov30"
          | "perception_camera_roadlines center_camera_fov120"
          | "perception_camera_roadlines nv_cameras"
      ? { topic: key; data: { polyline: LineUpdateData } }
      : { topic: key; data: LineUpdateData };
};

type CreateRenderMap = {
  [key in TopicType]: Line;
};

export default class PolylineRender extends Render {
  type: ALLRenderType = "polyline";

  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new Line(scene);
      if (topic === "dpc_planning_debug_info") {
        VIEW_WS.on(topic, (data: PolylineUpdateDataMap[typeof topic]) => {
          const renderItem = this.createRender[data.topic];
          renderItem.update(data.data.polyline_array);
        });
      } else if (
        topic === "perception_camera_roadlines center_camera_fov120" ||
        topic === "perception_camera_roadlines center_camera_fov30" ||
        topic === "perception_camera_roadlines nv_cameras"
      ) {
        VIEW_WS.on(topic, (data: PolylineUpdateDataMap[typeof topic]) => {
          const renderItem = this.createRender[data.topic];
          renderItem.update(data.data.polyline);
        });
      } else {
        VIEW_WS.on(topic, (data: PolylineUpdateDataMap[typeof topic]) => {
          const renderItem = this.createRender[data.topic];
          renderItem.update(data.data);
        });
      }
    });
  }

  dispose(): void {
    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.off(topic);
    }
    super.dispose();
  }
}
