import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP } from "@/constants";
import Render from "@/renderer/render";
import { VIEW_WS } from "@/utils/websocket";

import { Box, type BoxUpdateData } from "../public";

const topics = VIRTUAL_RENDER_MAP.target;
type TopicType = (typeof topics)[number];

type BoxUpdateDataMap = {
  [key in TopicType]: key extends "dpc_planning_debug_info"
    ? { topic: key; data: { box_array: BoxUpdateData } }
    : { topic: key; data: { box_target_array: BoxUpdateData } };
};

type CreateRenderMap = {
  [key in TopicType]: Box;
};

export default class BoxRender extends Render {
  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new Box(scene);
      if (topic === "dpc_planning_debug_info") {
        VIEW_WS.on(topic, (data: BoxUpdateDataMap[typeof topic]) => {
          const renderItem = this.createRender[data.topic];
          renderItem.update(data.data.box_array);
        });
      } else {
        VIEW_WS.on(topic, (data: BoxUpdateDataMap[typeof topic]) => {
          const renderItem = this.createRender[data.topic];
          renderItem.update(data.data.box_target_array);
        });
      }
    });
  }

  dispose(): void {
    for (const topic in this.createRender) {
      VIEW_WS.off(topic);
    }
    super.dispose();
  }
}
