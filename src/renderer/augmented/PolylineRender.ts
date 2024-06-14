import type { Scene } from "three";

import { Line, type LineUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = [
  "pilothmi_lane_lines",
  "pilothmi_stop_line",
  "pilothmi_planning_lines_info",
  "pilothmi_pilot_planning_trajectory"
] as const;
type TopicType = (typeof topic)[number];

type PolylineData = LineUpdateData;

type CreateRenderType = Line;

type CreateRenderMap = Record<TopicType, CreateRenderType>;

export default class PolylineRender extends Target {
  topic: readonly string[] = topic;

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

  update(data: PolylineData, topic: TopicType) {
    this.createRender[topic].update(data);
  }
}
