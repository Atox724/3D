import type { Scene } from "three";

import Target from "@/renderer/target";

import { Box, type BoxUpdateData } from "../public";

const topic = [
  "dpc_planning_debug_info",
  "perception_obstacle_fusion",
  "perception_fusion /perception/fusion/object",
  "perception_radar_front",
  "perception_camera_front",
  "perception_camera_nv"
] as const;
type TopicType = (typeof topic)[number];

type ArrowData1 = { box_array: BoxUpdateData };
type ArrowData2 = { box_target_array: BoxUpdateData };
type ArrowData = ArrowData1 | ArrowData2;

interface ArrowUpdateDataMap extends Record<TopicType, ArrowData> {
  dpc_planning_debug_info: ArrowData1;
  perception_obstacle_fusion: ArrowData2;
  "perception_fusion /perception/fusion/object": ArrowData2;
  perception_radar_front: ArrowData2;
  perception_camera_front: ArrowData2;
  perception_camera_nv: ArrowData2;
}

type CreateRenderType1 = { box_array: Box };
type CreateRenderType2 = { box_target_array: Box };
type CreateRenderType = CreateRenderType1 | CreateRenderType2;

interface CreateRenderMap extends Record<TopicType, CreateRenderType> {
  dpc_planning_debug_info: CreateRenderType1;
  perception_obstacle_fusion: CreateRenderType2;
  "perception_fusion /perception/fusion/object": CreateRenderType2;
  perception_radar_front: CreateRenderType2;
  perception_camera_front: CreateRenderType2;
  perception_camera_nv: CreateRenderType2;
}

export default class BoxRender extends Target {
  topic: readonly string[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      dpc_planning_debug_info: {
        box_array: new Box(scene)
      },
      perception_obstacle_fusion: {
        box_target_array: new Box(scene)
      },
      "perception_fusion /perception/fusion/object": {
        box_target_array: new Box(scene)
      },
      perception_radar_front: {
        box_target_array: new Box(scene)
      },
      perception_camera_front: {
        box_target_array: new Box(scene)
      },
      perception_camera_nv: {
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
