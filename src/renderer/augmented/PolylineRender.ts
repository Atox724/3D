import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP, AUGMENTED_RENDER_ORDER } from "@/constants";
import { Line, type LineUpdateData } from "@/renderer/public";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topic = AUGMENTED_RENDER_MAP.polyline;
type TopicType = (typeof topic)[number];

type PolylineUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: LineUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: Line;
};

export default class PolylineRender extends Render {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = AUGMENTED_RENDER_ORDER.LINE) {
    super();

    const createLine = () => new Line(scene, renderOrder);

    this.createRender = {
      pilothmi_lane_lines: createLine(),
      pilothmi_stop_line: createLine(),
      pilothmi_planning_lines_info: createLine(),
      pilothmi_pilot_planning_trajectory: createLine()
    };

    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.on(topic, (data: PolylineUpdateDataMap[TopicType]) => {
        this.createRender[data.topic].update(data.data);
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
