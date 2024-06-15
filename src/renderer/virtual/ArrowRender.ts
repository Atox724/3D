import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP } from "@/constants";
import Target from "@/renderer/target";

import { Arrow, type ArrowUpdateData } from "../public";

const topic = VIRTUAL_RENDER_MAP.arrow;
type TopicType = (typeof topic)[number];

type ArrowUpdateDataMap = {
  [key in TopicType]: { arrow_array: ArrowUpdateData } | ArrowUpdateData;
};

type CreateRenderMap = {
  [key in TopicType]: { arrow_array: Arrow } | Arrow;
};

export default class ArrowRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    const createArrowArray = () => ({ arrow_array: new Arrow(scene) });

    this.createRender = {
      perception_obstacle_fusion: createArrowArray(),
      "perception_fusion /perception/fusion/object": createArrowArray(),
      perception_radar_front: createArrowArray(),
      perception_camera_front: createArrowArray(),
      perception_camera_nv: createArrowArray(),
      localization_global_history_trajectory: new Arrow(scene),
      localization_local_history_trajectory: new Arrow(scene)
    };
  }

  update<T extends TopicType>(data: ArrowUpdateDataMap[T], topic: T) {
    const renderItem = this.createRender[topic];
    if ("arrow_array" in renderItem && "arrow_array" in data) {
      renderItem.arrow_array.update(data.arrow_array);
    } else if (!("arrow_array" in renderItem) && !("arrow_array" in data)) {
      renderItem.update(data);
    } else {
      console.error(`[ArrowRender] topic: ${topic} is not match with data`);
    }
  }
}
