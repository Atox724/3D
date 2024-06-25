import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP } from "@/constants";
import { Pole, type PoleUpdateData } from "@/renderer/public";
import type { ALLRenderType } from "@/typings";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topics = AUGMENTED_RENDER_MAP.poleModel;
type TopicType = (typeof topics)[number];

type PoleUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: PoleUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: Pole;
};

export default class PoleRender extends Render {
  type: ALLRenderType = "poleModel";

  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new Pole(scene);
      VIEW_WS.on(topic, (data: PoleUpdateDataMap[typeof topic]) => {
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
