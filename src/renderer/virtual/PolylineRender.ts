import type { Scene } from "three";

import { PERCEPTION_RENDER_TOPIC } from "@/constants";
import { Line, type LineUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = [
  PERCEPTION_RENDER_TOPIC.DPC_PLANNING_DEBUG_INFO,
  PERCEPTION_RENDER_TOPIC.DPC_PLANNING_OTHERLINE,
  PERCEPTION_RENDER_TOPIC.DPC_PLANNING_REFERENCE_LINE,
  PERCEPTION_RENDER_TOPIC.DPC_PLANNING_EDGELINE,
  PERCEPTION_RENDER_TOPIC.DPC_LFP_PLANNING_TRAJECTORY,
  PERCEPTION_RENDER_TOPIC.DPC_LFP_PLANNING_PLANLINE,

  PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_ROADLINES_CENTER_FOV30,
  PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_ROADLINES_CENTER_FOV120,
  PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_ROADLINES_NV,

  PERCEPTION_RENDER_TOPIC.LOCALMAP_CENTER_LINE,
  PERCEPTION_RENDER_TOPIC.LOCALMAP_LANE_LINE,
  PERCEPTION_RENDER_TOPIC.LOCALMAP_STOP_LINE,
  PERCEPTION_RENDER_TOPIC.LOCALMAP_SPEEDBUMP,

  PERCEPTION_RENDER_TOPIC.MEMDRIVE_REF_ROUTE_TRAJECTORY
] as const;
type TopicType = (typeof topic)[number];

type PolylineData1 = { polyline_array: LineUpdateData };
type PolylineData2 = { polyline: LineUpdateData };
type PolylineData3 = LineUpdateData;
type PolylineData = PolylineData1 | PolylineData2 | PolylineData3;

interface PolylineUpdateDataMap extends Record<TopicType, PolylineData> {
  [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_DEBUG_INFO]: PolylineData1;
  [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_OTHERLINE]: PolylineData3;
  [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_REFERENCE_LINE]: PolylineData3;
  [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_EDGELINE]: PolylineData3;
  [PERCEPTION_RENDER_TOPIC.DPC_LFP_PLANNING_TRAJECTORY]: PolylineData3;
  [PERCEPTION_RENDER_TOPIC.DPC_LFP_PLANNING_PLANLINE]: PolylineData3;

  [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_ROADLINES_CENTER_FOV30]: PolylineData2;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_ROADLINES_CENTER_FOV120]: PolylineData2;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_ROADLINES_NV]: PolylineData2;

  [PERCEPTION_RENDER_TOPIC.LOCALMAP_CENTER_LINE]: PolylineData3;
  [PERCEPTION_RENDER_TOPIC.LOCALMAP_LANE_LINE]: PolylineData3;
  [PERCEPTION_RENDER_TOPIC.LOCALMAP_STOP_LINE]: PolylineData3;
  [PERCEPTION_RENDER_TOPIC.LOCALMAP_SPEEDBUMP]: PolylineData3;

  [PERCEPTION_RENDER_TOPIC.MEMDRIVE_REF_ROUTE_TRAJECTORY]: PolylineData3;
}

type CreateRenderType1 = { polyline_array: Line };
type CreateRenderType2 = { polyline: Line };
type CreateRenderType3 = Line;
type CreateRenderType =
  | CreateRenderType1
  | CreateRenderType2
  | CreateRenderType3;

interface CreateRenderMap extends Record<TopicType, CreateRenderType> {
  [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_DEBUG_INFO]: CreateRenderType1;
  [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_OTHERLINE]: CreateRenderType3;
  [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_REFERENCE_LINE]: CreateRenderType3;
  [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_EDGELINE]: CreateRenderType3;
  [PERCEPTION_RENDER_TOPIC.DPC_LFP_PLANNING_TRAJECTORY]: CreateRenderType3;
  [PERCEPTION_RENDER_TOPIC.DPC_LFP_PLANNING_PLANLINE]: CreateRenderType3;

  [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_ROADLINES_CENTER_FOV30]: CreateRenderType2;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_ROADLINES_CENTER_FOV120]: CreateRenderType2;
  [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_ROADLINES_NV]: CreateRenderType2;

  [PERCEPTION_RENDER_TOPIC.LOCALMAP_CENTER_LINE]: CreateRenderType3;
  [PERCEPTION_RENDER_TOPIC.LOCALMAP_LANE_LINE]: CreateRenderType3;
  [PERCEPTION_RENDER_TOPIC.LOCALMAP_STOP_LINE]: CreateRenderType3;
  [PERCEPTION_RENDER_TOPIC.LOCALMAP_SPEEDBUMP]: CreateRenderType3;

  [PERCEPTION_RENDER_TOPIC.MEMDRIVE_REF_ROUTE_TRAJECTORY]: CreateRenderType3;
}

export default class PolylineRender extends Target {
  topic: readonly string[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_DEBUG_INFO]: {
        polyline_array: new Line(scene)
      },
      [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_OTHERLINE]: new Line(scene),
      [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_REFERENCE_LINE]: new Line(scene),
      [PERCEPTION_RENDER_TOPIC.DPC_PLANNING_EDGELINE]: new Line(scene),
      [PERCEPTION_RENDER_TOPIC.DPC_LFP_PLANNING_TRAJECTORY]: new Line(scene),
      [PERCEPTION_RENDER_TOPIC.DPC_LFP_PLANNING_PLANLINE]: new Line(scene),

      [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_ROADLINES_CENTER_FOV30]: {
        polyline: new Line(scene)
      },
      [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_ROADLINES_CENTER_FOV120]: {
        polyline: new Line(scene)
      },
      [PERCEPTION_RENDER_TOPIC.PERCEPTION_CAMERA_ROADLINES_NV]: {
        polyline: new Line(scene)
      },

      [PERCEPTION_RENDER_TOPIC.LOCALMAP_CENTER_LINE]: new Line(scene),
      [PERCEPTION_RENDER_TOPIC.LOCALMAP_LANE_LINE]: new Line(scene),
      [PERCEPTION_RENDER_TOPIC.LOCALMAP_STOP_LINE]: new Line(scene),
      [PERCEPTION_RENDER_TOPIC.LOCALMAP_SPEEDBUMP]: new Line(scene),

      [PERCEPTION_RENDER_TOPIC.MEMDRIVE_REF_ROUTE_TRAJECTORY]: new Line(scene)
    };
  }

  update<T extends TopicType>(data: PolylineUpdateDataMap[T], topic: T) {
    if ("polyline_array" in data) {
      (this.createRender[topic] as CreateRenderType1).polyline_array.update(
        data.polyline_array
      );
    } else if ("polyline" in data) {
      (this.createRender[topic] as CreateRenderType2).polyline.update(
        data.polyline
      );
    } else {
      (this.createRender[topic] as CreateRenderType3).update(data);
    }
  }
}
