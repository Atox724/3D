import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP, VIRTUAL_RENDER_ORDER } from "@/constants";
import Render from "@/renderer/render";
import { VIEW_WS } from "@/utils/websocket";

import { Arrow, type ArrowUpdateData } from "../public";

const topic = VIRTUAL_RENDER_MAP.arrow;
type TopicType = (typeof topic)[number];

type ArrowUpdateDataMap = {
  [key in TopicType]:
    | {
        topic: TopicType;
        data: { arrow_array: ArrowUpdateData };
      }
    | {
        topic: TopicType;
        data: ArrowUpdateData;
      };
};

type CreateRenderMap = {
  [key in TopicType]: { arrow_array: Arrow } | Arrow;
};

export default class ArrowRender extends Render {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = VIRTUAL_RENDER_ORDER.ARROW) {
    super();

    const createArrow = () => new Arrow(scene, renderOrder);
    const createArrowArray = () => ({
      arrow_array: new Arrow(scene, renderOrder)
    });

    this.createRender = {
      perception_obstacle_fusion: createArrowArray(),
      "perception_fusion /perception/fusion/object": createArrowArray(),
      perception_radar_front: createArrowArray(),
      perception_camera_front: createArrowArray(),
      perception_camera_nv: createArrowArray(),
      localization_global_history_trajectory: createArrow(),
      localization_local_history_trajectory: createArrow()
    };

    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.on(topic, (data: ArrowUpdateDataMap[TopicType]) => {
        const renderItem = this.createRender[data.topic];
        if ("arrow_array" in renderItem && "arrow_array" in data.data) {
          renderItem.arrow_array.update(data.data.arrow_array);
        } else if (
          !("arrow_array" in renderItem) &&
          !("arrow_array" in data.data)
        ) {
          renderItem.update(data.data);
        } else {
          console.error(
            `[ArrowRender] topic: ${data.topic} is not match with data`
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
