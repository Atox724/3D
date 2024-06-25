import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP } from "@/constants";
import Render from "@/renderer/render";
import type { ALLRenderType } from "@/typings";
import { VIEW_WS } from "@/utils/websocket";

import { Arrow, type ArrowUpdateData } from "../public";

const topics = VIRTUAL_RENDER_MAP.arrow;
type TopicType = (typeof topics)[number];

type ArrowUpdateDataMap = {
  [key in TopicType]: key extends
    | "localization_global_history_trajectory"
    | "localization_local_history_trajectory"
    ? { topic: key; data: ArrowUpdateData }
    : key extends "fusion_gop"
      ? { topic: key; data: { heading_arrow_array: ArrowUpdateData } }
      : { topic: key; data: { arrow_array: ArrowUpdateData } };
};

type CreateRenderMap = {
  [key in TopicType]: Arrow;
};

export default class ArrowRender extends Render {
  type: ALLRenderType = "arrow";

  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new Arrow(scene);
      if (
        topic === "localization_global_history_trajectory" ||
        topic === "localization_local_history_trajectory"
      ) {
        VIEW_WS.on(topic, (data: ArrowUpdateDataMap[typeof topic]) => {
          const renderItem = this.createRender[data.topic];
          renderItem.update(data.data);
        });
      } else if (topic === "fusion_gop") {
        VIEW_WS.on(topic, (data: ArrowUpdateDataMap[typeof topic]) => {
          const renderItem = this.createRender[data.topic];
          renderItem.update(data.data.heading_arrow_array);
        });
      } else {
        VIEW_WS.on(topic, (data: ArrowUpdateDataMap[typeof topic]) => {
          const renderItem = this.createRender[data.topic];
          renderItem.update(data.data.arrow_array);
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
