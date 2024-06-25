import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP } from "@/constants";
import { RoadMarker, type RoadMarkerUpdateData } from "@/renderer/public";
import type { ALLRenderType } from "@/typings";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topics = AUGMENTED_RENDER_MAP.roadMarkerModel;
type TopicType = (typeof topics)[number];

type RoadMarkerUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: RoadMarkerUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: RoadMarker;
};

export default class RoadMarkerRender extends Render {
  type: ALLRenderType = "roadMarkerModel";

  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new RoadMarker(scene);
      VIEW_WS.on(topic, (data: RoadMarkerUpdateDataMap[typeof topic]) => {
        this.createRender[data.topic].update(data.data);
      });
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
