import type { Scene } from "three";

import Target from "@/renderer/target";

import { Arrow, type ArrowUpdateData } from "../public";

const topic = [
  "perception_obstacle_fusion",
  "perception_fusion /perception/fusion/object",
  "perception_radar_front",
  "perception_camera_front",
  "perception_camera_nv",

  "localization_global_history_trajectory",
  "localization_local_history_trajectory"
] as const;
type TopicType = (typeof topic)[number];

type ArrowData1 = { arrow_array: ArrowUpdateData };
type ArrowData2 = ArrowUpdateData;
type ArrowData = ArrowData1 | ArrowData2;

interface ArrowUpdateDataMap extends Record<TopicType, ArrowData> {
  perception_obstacle_fusion: ArrowData1;
  "perception_fusion /perception/fusion/object": ArrowData1;
  perception_radar_front: ArrowData1;
  perception_camera_front: ArrowData1;
  perception_camera_nv: ArrowData1;
  localization_global_history_trajectory: ArrowData2;
  localization_local_history_trajectory: ArrowData2;
}

type CreateRenderType1 = { arrow_array: Arrow };
type CreateRenderType2 = Arrow;
type CreateRenderType = CreateRenderType1 | CreateRenderType2;

interface CreateRenderMap extends Record<TopicType, CreateRenderType> {
  perception_obstacle_fusion: CreateRenderType1;
  "perception_fusion /perception/fusion/object": CreateRenderType1;
  perception_radar_front: CreateRenderType1;
  perception_camera_front: CreateRenderType1;
  perception_camera_nv: CreateRenderType1;
  localization_global_history_trajectory: CreateRenderType2;
  localization_local_history_trajectory: CreateRenderType2;
}

export default class ArrowRender extends Target {
  topic: readonly string[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      perception_obstacle_fusion: {
        arrow_array: new Arrow(scene)
      },
      "perception_fusion /perception/fusion/object": {
        arrow_array: new Arrow(scene)
      },
      perception_radar_front: {
        arrow_array: new Arrow(scene)
      },
      perception_camera_front: {
        arrow_array: new Arrow(scene)
      },
      perception_camera_nv: {
        arrow_array: new Arrow(scene)
      },
      localization_global_history_trajectory: new Arrow(scene),
      localization_local_history_trajectory: new Arrow(scene)
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
