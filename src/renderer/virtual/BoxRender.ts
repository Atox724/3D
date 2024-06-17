import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP, VIRTUAL_RENDER_ORDER } from "@/constants";
import Render from "@/renderer/render";
import { VIEW_WS } from "@/utils/websocket";

import { Box, type BoxUpdateData } from "../public";

const topic = VIRTUAL_RENDER_MAP.target;
type TopicType = (typeof topic)[number];

type BoxData = {
  [key in TopicType]:
    | {
        topic: TopicType;
        data: { box_array: BoxUpdateData };
      }
    | {
        topic: TopicType;
        data: { box_target_array: BoxUpdateData };
      };
};

type CreateRenderMap = {
  [key in TopicType]: { box_array: Box } | { box_target_array: Box };
};

export default class BoxRender extends Render {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = VIRTUAL_RENDER_ORDER.BOX) {
    super();

    const createBoxArray = () => ({ box_array: new Box(scene, renderOrder) });
    const createBoxTargetArray = () => ({
      box_target_array: new Box(scene, renderOrder)
    });

    this.createRender = {
      dpc_planning_debug_info: createBoxArray(),
      perception_obstacle_fusion: createBoxTargetArray(),
      "perception_fusion /perception/fusion/object": createBoxTargetArray(),
      perception_radar_front: createBoxTargetArray(),
      perception_camera_front: createBoxTargetArray(),
      perception_camera_nv: createBoxTargetArray()
    };

    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.on(topic, (data: BoxData[TopicType]) => {
        const renderItem = this.createRender[data.topic];
        if ("box_array" in renderItem && "box_array" in data.data) {
          renderItem.box_array.update(data.data.box_array);
        } else if (
          "box_target_array" in renderItem &&
          "box_target_array" in data.data
        ) {
          renderItem.box_target_array.update(data.data.box_target_array);
        } else {
          console.error(
            `[BoxRender] topic: ${data.topic} is not match with data`
          );
        }
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
