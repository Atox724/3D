import type { Scene } from "three";

import { PERCEPTION_RENDER_TOPIC } from "@/constants";
import Target from "@/renderer/target";

import { Polygon, type PolygonUpdateData } from "../public";

const topic = [PERCEPTION_RENDER_TOPIC.PERCEPTION_FUSION] as const;
type TopicType = (typeof topic)[number];

type PolygonData = { polygon_array: PolygonUpdateData };

type CreateRenderType = { polygon_array: Polygon };

type CreateRenderMap = Record<TopicType, CreateRenderType>;

export default class PolygonRender extends Target {
  topic: readonly string[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      [PERCEPTION_RENDER_TOPIC.PERCEPTION_FUSION]: {
        polygon_array: new Polygon(scene)
      }
    };
  }
  update(data: PolygonData, topic: TopicType) {
    this.createRender[topic].polygon_array.update(data.polygon_array);
  }
}
