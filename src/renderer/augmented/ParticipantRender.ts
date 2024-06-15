import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP } from "@/constants";
import { Participant, type ParticipantUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = AUGMENTED_RENDER_MAP.participantModel;
type TopicType = (typeof topic)[number];

type ParticipantUpdateDataMap = {
  [key in TopicType]: ParticipantUpdateData;
};

type CreateRenderMap = {
  [key in TopicType]: Participant;
};

export default class ParticipantRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      "pilothmi_perception_traffic_participant_fusion object": new Participant(
        scene
      )
    };
  }

  update<T extends TopicType>(data: ParticipantUpdateDataMap[T], topic: T) {
    this.createRender[topic].update(data);
  }
}
