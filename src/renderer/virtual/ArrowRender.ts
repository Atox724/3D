import type { Scene } from "three";

import { PERCEPTION_RENDER_TOPIC } from "@/constants";
import Target from "@/renderer/target";

import { Arrow, type ArrowUpdateData } from "../public";

const topic = [
  PERCEPTION_RENDER_TOPIC.PERCEPTION_OBSTACLE_FUSION,
  PERCEPTION_RENDER_TOPIC.PERCEPTION_FUSION,
  PERCEPTION_RENDER_TOPIC.PERCEPTION_RADAR_FRONT,
  PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_FRONT,
  PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_NV,

  PERCEPTION_RENDER_TOPIC.LOCALIZATION_GLOBAL_HISTORY_TRAJECTORY,
  PERCEPTION_RENDER_TOPIC.LOCALIZATION_LOCAL_HISTORY_TRAJECTORY
] as const;
type TopicType = (typeof topic)[number];

type ArrowData1 = { arrow_array: ArrowUpdateData };
type ArrowData2 = ArrowUpdateData;
type ArrowData = ArrowData1 | ArrowData2;

interface ArrowUpdateDataMap extends Record<TopicType, ArrowData> {
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_OBSTACLE_FUSION]: ArrowData1;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_FUSION]: ArrowData1;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_RADAR_FRONT]: ArrowData1;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_FRONT]: ArrowData1;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_NV]: ArrowData1;

  [PERCEPTION_RENDER_TOPIC.LOCALIZATION_GLOBAL_HISTORY_TRAJECTORY]: ArrowData2;
  [PERCEPTION_RENDER_TOPIC.LOCALIZATION_LOCAL_HISTORY_TRAJECTORY]: ArrowData2;
}

type CreateRenderType1 = { arrow_array: Arrow };
type CreateRenderType2 = Arrow;
type CreateRenderType = CreateRenderType1 | CreateRenderType2;

interface CreateRenderMap extends Record<TopicType, CreateRenderType> {
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_OBSTACLE_FUSION]: CreateRenderType1;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_FUSION]: CreateRenderType1;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_RADAR_FRONT]: CreateRenderType1;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_FRONT]: CreateRenderType1;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_NV]: CreateRenderType1;

  [PERCEPTION_RENDER_TOPIC.LOCALIZATION_GLOBAL_HISTORY_TRAJECTORY]: CreateRenderType2;
  [PERCEPTION_RENDER_TOPIC.LOCALIZATION_LOCAL_HISTORY_TRAJECTORY]: CreateRenderType2;
}

export default class ArrowRender extends Target {
  topic: readonly string[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      [PERCEPTION_RENDER_TOPIC.PERCEPTION_OBSTACLE_FUSION]: {
        arrow_array: new Arrow(scene)
      },
      [PERCEPTION_RENDER_TOPIC.PERCEPTION_FUSION]: {
        arrow_array: new Arrow(scene)
      },
      [PERCEPTION_RENDER_TOPIC.PERCEPTION_RADAR_FRONT]: {
        arrow_array: new Arrow(scene)
      },
      [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_FRONT]: {
        arrow_array: new Arrow(scene)
      },
      [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_NV]: {
        arrow_array: new Arrow(scene)
      },
      [PERCEPTION_RENDER_TOPIC.LOCALIZATION_GLOBAL_HISTORY_TRAJECTORY]:
        new Arrow(scene),
      [PERCEPTION_RENDER_TOPIC.LOCALIZATION_LOCAL_HISTORY_TRAJECTORY]:
        new Arrow(scene)
    };
  }

  update<T extends TopicType>(data: ArrowUpdateDataMap[T], topic: T) {
    if ("arrow_array" in data) {
      (this.createRender[topic] as CreateRenderType1).arrow_array.update(
        data.arrow_array
      );
    } else {
      (this.createRender[topic] as CreateRenderType2).update(data);
    }
  }
}
