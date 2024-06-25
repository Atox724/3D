import type { Scene } from "three";

import { ALL_TOPICS, type VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { Polyline, type PolylineUpdateData } from "../common";

type POLYLINE_TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.polyline)[number];

export default class PolylineRender extends Polyline {
  topic: POLYLINE_TOPIC_TYPE;
  constructor(scene: Scene, topic: POLYLINE_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    const createUpdateHanlder = () => {
      if (
        topic === ALL_TOPICS.PERCEPTION_CAMERA_ROADLINES_CENTER_CAMERA_FOV120 ||
        topic === ALL_TOPICS.PERCEPTION_CAMERA_ROADLINES_CENTER_CAMERA_FOV30 ||
        topic === ALL_TOPICS.PERCEPTION_CAMERA_ROADLINES_NV_CAMERAS
      ) {
        return (data: {
          data: { polyline: PolylineUpdateData };
          topic: POLYLINE_TOPIC_TYPE;
        }) => {
          this.update(data.data.polyline);
        };
      }
      if (topic === ALL_TOPICS.DPC_PLANNING_DEBUG_INFO) {
        return (data: {
          data: { polyline_array: PolylineUpdateData };
          topic: POLYLINE_TOPIC_TYPE;
        }) => {
          this.update(data.data.polyline_array);
        };
      }
      return (data: {
        data: PolylineUpdateData;
        topic: POLYLINE_TOPIC_TYPE;
      }) => {
        this.update(data.data);
      };
    };
    const updateHandler = createUpdateHanlder();
    VIEW_WS.on(topic, updateHandler);
  }
}
