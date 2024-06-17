import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP, AUGMENTED_RENDER_ORDER } from "@/constants";
import { Line, type LineUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = AUGMENTED_RENDER_MAP.polyline;
type TopicType = (typeof topic)[number];

type PolylineUpdateDataMap = {
  [key in TopicType]: LineUpdateData;
};

type CreateRenderMap = {
  [key in TopicType]: Line;
};

export default class PolylineRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = AUGMENTED_RENDER_ORDER.LINE) {
    super(scene, renderOrder);

    const createLine = () => new Line(scene, renderOrder);

    this.createRender = {
      pilothmi_lane_lines: createLine(),
      pilothmi_stop_line: createLine(),
      pilothmi_planning_lines_info: createLine(),
      pilothmi_pilot_planning_trajectory: createLine()
    };
  }

  update<T extends TopicType>(data: PolylineUpdateDataMap[T], topic: T) {
    this.createRender[topic].update(data);
  }
}
