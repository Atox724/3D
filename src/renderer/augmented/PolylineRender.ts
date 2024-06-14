import type { Scene } from "three";

import { PILOTHMI_RENDER_TOPIC } from "@/constants";
import { Line, type LineUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = [
  PILOTHMI_RENDER_TOPIC.PILOTHMI_LANE_LINES,
  PILOTHMI_RENDER_TOPIC.PILOTHMI_STOP_LINE,
  PILOTHMI_RENDER_TOPIC.PILOTHMI_PLANNING_LINES_INFO,
  PILOTHMI_RENDER_TOPIC.PILOTHMI_PILOT_PLANNING_TRAJECTORY
] as const;
type TopicType = (typeof topic)[number];

type PolylineData = LineUpdateData;

type CreateRenderType = Line;

type CreateRenderMap = Record<TopicType, CreateRenderType>;

export default class PolylineRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      [PILOTHMI_RENDER_TOPIC.PILOTHMI_LANE_LINES]: new Line(scene),
      [PILOTHMI_RENDER_TOPIC.PILOTHMI_STOP_LINE]: new Line(scene),
      [PILOTHMI_RENDER_TOPIC.PILOTHMI_PLANNING_LINES_INFO]: new Line(scene),
      [PILOTHMI_RENDER_TOPIC.PILOTHMI_PILOT_PLANNING_TRAJECTORY]: new Line(
        scene
      )
    };
  }

  update(data: PolylineData, topic: TopicType) {
    this.createRender[topic].update(data);
  }
}
