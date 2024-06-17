import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP, AUGMENTED_RENDER_ORDER } from "@/constants";
import { Participant, type ParticipantUpdateData } from "@/renderer/public";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topic = AUGMENTED_RENDER_MAP.participantModel;
type TopicType = (typeof topic)[number];

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
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = AUGMENTED_RENDER_ORDER.PARTICIPANT) {
    super();

    this.createRender = {
      "pilothmi_perception_traffic_participant_fusion object": new Participant(
        scene,
        renderOrder
      )
    };

    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.on(topic, (data: ParticipantUpdateDataMap[TopicType]) => {
        this.createRender[data.topic].update(data.data);
      });
    }
  }

  dispose(): void {
    for (const topic in this.createRender) {
      VIEW_WS.off(topic);
    }
    super.dispose();
  }
}
