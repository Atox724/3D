import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP } from "@/constants";
import Target from "@/renderer/target";

import { Box, type BoxUpdateData } from "../public";

const topic = VIRTUAL_RENDER_MAP.target;
type TopicType = (typeof topic)[number];

type BoxData = {
  [key in TopicType]:
    | { box_array: BoxUpdateData }
    | { box_target_array: BoxUpdateData };
};

type CreateRenderMap = {
  [key in TopicType]: { box_array: Box } | { box_target_array: Box };
};

export default class BoxRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    const createBoxArray = () => ({ box_array: new Box(scene) });
    const createBoxTargetArray = () => ({ box_target_array: new Box(scene) });

    this.createRender = {
      dpc_planning_debug_info: createBoxArray(),
      perception_obstacle_fusion: createBoxTargetArray(),
      "perception_fusion /perception/fusion/object": createBoxTargetArray(),
      perception_radar_front: createBoxTargetArray(),
      perception_camera_front: createBoxTargetArray(),
      perception_camera_nv: createBoxTargetArray()
    };
  }

  update<T extends TopicType>(data: BoxData[T], topic: T) {
    const renderItem = this.createRender[topic];

    if ("box_array" in renderItem && "box_array" in data) {
      renderItem.box_array.update(data.box_array);
    } else if ("box_target_array" in renderItem && "box_target_array" in data) {
      renderItem.box_target_array.update(data.box_target_array);
    } else {
      console.error(`[BoxRender] topic: ${topic} is not match with data`);
    }
  }
}
