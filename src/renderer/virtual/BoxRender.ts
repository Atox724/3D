import type { Scene } from "three";

import { PERCEPTION_RENDER_TOPIC } from "@/constants";
import Target from "@/renderer/target";

import { Box, type BoxUpdateData } from "../public";

const topic = [
  PERCEPTION_RENDER_TOPIC.DPC_PLANNING_DEBUG_INFO,

  PERCEPTION_RENDER_TOPIC.PERCEPTION_OBSTACLE_FUSION,
  PERCEPTION_RENDER_TOPIC.PERCEPTION_FUSION,
  PERCEPTION_RENDER_TOPIC.PERCEPTION_RADAR_FRONT,
  PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_FRONT,
  PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_NV
] as const;
type TopicType = (typeof topic)[number];

type ArrowData1 = { box_array: BoxUpdateData };
type ArrowData2 = { box_target_array: BoxUpdateData };
type ArrowData = ArrowData1 | ArrowData2;

interface ArrowUpdateDataMap extends Record<TopicType, ArrowData> {
  [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_DEBUG_INFO]: ArrowData1;

  [PERCEPTION_RENDER_TOPIC.PERCEPTION_OBSTACLE_FUSION]: ArrowData2;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_FUSION]: ArrowData2;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_RADAR_FRONT]: ArrowData2;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_FRONT]: ArrowData2;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_NV]: ArrowData2;
}

type CreateRenderType1 = { box_array: Box };
type CreateRenderType2 = { box_target_array: Box };
type CreateRenderType = CreateRenderType1 | CreateRenderType2;

interface CreateRenderMap extends Record<TopicType, CreateRenderType> {
  [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_DEBUG_INFO]: CreateRenderType1;

  [PERCEPTION_RENDER_TOPIC.PERCEPTION_OBSTACLE_FUSION]: CreateRenderType2;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_FUSION]: CreateRenderType2;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_RADAR_FRONT]: CreateRenderType2;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_FRONT]: CreateRenderType2;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_NV]: CreateRenderType2;
}

export default class BoxRender extends Target {
  topic: readonly string[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_DEBUG_INFO]: {
        box_array: new Box(scene)
      },
      [PERCEPTION_RENDER_TOPIC.PERCEPTION_OBSTACLE_FUSION]: {
        box_target_array: new Box(scene)
      },
      [PERCEPTION_RENDER_TOPIC.PERCEPTION_FUSION]: {
        box_target_array: new Box(scene)
      },
      [PERCEPTION_RENDER_TOPIC.PERCEPTION_RADAR_FRONT]: {
        box_target_array: new Box(scene)
      },
      [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_FRONT]: {
        box_target_array: new Box(scene)
      },
      [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_NV]: {
        box_target_array: new Box(scene)
      }
    };
  }

  update<T extends TopicType>(data: ArrowUpdateDataMap[T], topic: T) {
    if ("box_array" in data) {
      (this.createRender[topic] as CreateRenderType1).box_array.update(
        data.box_array
      );
    } else {
      (this.createRender[topic] as CreateRenderType2).box_target_array.update(
        data.box_target_array
      );
    }
  }
}
