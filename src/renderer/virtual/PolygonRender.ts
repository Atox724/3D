import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP } from "@/constants";
import Target from "@/renderer/target";

import { Polygon, type PolygonUpdateData } from "../public";

const topic = VIRTUAL_RENDER_MAP.polygon;
type TopicType = (typeof topic)[number];

type ArrowUpdateDataMap = {
  [key in TopicType]: { polygon_array: PolygonUpdateData };
};

type CreateRenderMap = {
  [key in TopicType]: { polygon_array: Polygon };
};
export default class PolygonRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    const createPolygonArray = () => ({ polygon_array: new Polygon(scene) });

    this.createRender = {
      perception_camera_front: createPolygonArray(),
      perception_camera_nv: createPolygonArray(),
      "perception_fusion /perception/fusion/object": createPolygonArray(),
      perception_obstacle_fusion: createPolygonArray()
    };
  }
  update<T extends TopicType>(data: ArrowUpdateDataMap[T], topic: T) {
    this.createRender[topic].polygon_array.update(data.polygon_array);
  }
}
