import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP } from "@/constants";
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

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      pilothmi_lane_lines: new Line(scene),
      pilothmi_stop_line: new Line(scene),
      pilothmi_planning_lines_info: new Line(scene),
      pilothmi_pilot_planning_trajectory: new Line(scene)
    };
  }

  update<T extends TopicType>(data: PolylineUpdateDataMap[T], topic: T) {
    this.createRender[topic].update(data);
  }
}
