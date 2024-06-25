import type { Scene } from "three";

import type { AUGMENTED_RENDER_MAP } from "@/constants/topic";
import { RoadMarker, type RoadMarkerUpdateData } from "@/renderer/common";
import { VIEW_WS } from "@/utils/websocket";

type ROAD_MARKER_MODEL_TOPIC_TYPE =
  (typeof AUGMENTED_RENDER_MAP.roadMarkerModel)[number];

export default class RoadMarkerRender extends RoadMarker {
  topic: ROAD_MARKER_MODEL_TOPIC_TYPE;

  constructor(scene: Scene, topic: ROAD_MARKER_MODEL_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: {
        data: RoadMarkerUpdateData;
        topic: ROAD_MARKER_MODEL_TOPIC_TYPE;
      }) => {
        this.update(data.data);
      }
    );
  }
}
