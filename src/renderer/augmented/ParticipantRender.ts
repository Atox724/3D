import type { Scene } from "three";

import type { AUGMENTED_RENDER_MAP } from "@/constants/topic";
import { Participant, type ParticipantUpdateData } from "@/renderer/common";
import { VIEW_WS } from "@/utils/websocket";

type PARTICIPANT_MODEL_TOPIC_TYPE =
  (typeof AUGMENTED_RENDER_MAP.participantModel)[number];

export default class ParticipantRender extends Participant {
  topic: PARTICIPANT_MODEL_TOPIC_TYPE;

  constructor(scene: Scene, topic: PARTICIPANT_MODEL_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: {
        data: ParticipantUpdateData;
        topic: PARTICIPANT_MODEL_TOPIC_TYPE;
      }) => {
        this.update(data.data);
      }
    );
  }
}
