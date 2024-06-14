import type { Scene } from "three";

import { LineRender, type LineUpdateData } from "@/renderer/public";

import type Target from "../target";
import PolylineRender from "./PolylineRender";

const topic = [
  "localmap_center_line",
  "localmap_lane_line",
  "localmap_stop_line"
] as const;
type TopicType = (typeof topic)[number];

export default class LaneLineRender extends LineRender {
  topic: readonly TopicType[] = topic;

  createRender: { [k in TopicType]: Target };

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      localmap_center_line: new PolylineRender(scene),
      localmap_lane_line: new PolylineRender(scene),
      localmap_stop_line: new PolylineRender(scene)
    };
  }

  update(data: LineUpdateData, topic: TopicType) {
    this.createRender[topic].update(data);
  }
}
