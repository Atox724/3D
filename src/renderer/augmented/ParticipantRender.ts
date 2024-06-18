import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP } from "@/constants";
import { Participant, type ParticipantUpdateData } from "@/renderer/public";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topics = AUGMENTED_RENDER_MAP.participantModel;
type TopicType = (typeof topics)[number];

type ParticipantUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: ParticipantUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: Participant;
};

export default class ParticipantRender extends Render {
  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new Participant(scene);
      VIEW_WS.on(topic, (data: ParticipantUpdateDataMap[typeof topic]) => {
        this.createRender[data.topic].update(data.data);
      });
    });
  }

  dispose(): void {
    for (const topic in this.createRender) {
      VIEW_WS.off(topic);
    }
    super.dispose();
  }
}
