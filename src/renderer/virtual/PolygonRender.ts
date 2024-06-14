import type { Scene } from "three";

import Target from "@/renderer/target";

import { Polygon, type PolygonUpdateData } from "../public";

const topic = ["perception_fusion /perception/fusion/object"] as const;
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
      "perception_fusion /perception/fusion/object": {
        polygon_array: new Polygon(scene)
      }
    };
  }
  update(data: PolygonData, topic: TopicType) {
    this.createRender[topic].polygon_array.update(data.polygon_array);
  }
}
