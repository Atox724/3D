import type { Scene } from "three";

import { ALL_TOPICS, type VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { Target, type TargetUpdateData } from "../public";

type TARGET_TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.target)[number];

export default class TargetRender extends Target {
  topic: TARGET_TOPIC_TYPE;
  constructor(scene: Scene, topic: TARGET_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    const createUpdateHanlder = () => {
      if (topic === ALL_TOPICS.DPC_PLANNING_DEBUG_INFO) {
        return (data: {
          data: { box_array: TargetUpdateData };
          topic: TARGET_TOPIC_TYPE;
        }) => {
          this.update(data.data.box_array);
        };
      }
      return (data: {
        data: { box_target_array: TargetUpdateData };
        topic: TARGET_TOPIC_TYPE;
      }) => {
        this.update(data.data.box_target_array);
      };
    };
    const updateHandler = createUpdateHanlder();
    VIEW_WS.on(topic, updateHandler);
  }
}
