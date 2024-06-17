import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP } from "@/constants";
import { VIEW_WS } from "@/utils/websocket";

import { Polygon, type PolygonUpdateData } from "../public";
import Render from "../render";

const topic = VIRTUAL_RENDER_MAP.polygon;
type TopicType = (typeof topic)[number];

type ArrowUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: { polygon_array: PolygonUpdateData };
  };
};

type CreateRenderMap = {
  [key in TopicType]: { polygon_array: Polygon };
};
export default class PolygonRender extends Render {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = 0) {
    super();

    const createPolygonArray = () => ({
      polygon_array: new Polygon(scene, renderOrder)
    });

    this.createRender = {
      perception_camera_front: createPolygonArray(),
      perception_camera_nv: createPolygonArray(),
      "perception_fusion /perception/fusion/object": createPolygonArray(),
      perception_obstacle_fusion: createPolygonArray(),
      // 旧接口
      perception_fusion_object: createPolygonArray()
    };

    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.on(topic, (data: ArrowUpdateDataMap[TopicType]) => {
        this.createRender[data.topic].polygon_array.update(
          data.data.polygon_array
        );
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
