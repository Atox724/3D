import {
  CrosswalkRender,
  FreespaceRender,
  ObstacleRender,
  ParticipantRender,
  TrafficLightRender,
  TrafficSignalRender
} from "@/renderer/modules";
import { VIEW_WS } from "@/utils/websocket";

import { Renderer } from "./BasicRender";
import type { Target } from "./BasicTarget";

class ProRender extends Renderer {
  createRender: Target[];

  constructor() {
    super();
    this.createRender = [
      new ObstacleRender(this.scene),
      new ParticipantRender(this.scene),
      new FreespaceRender(this.scene),
      new TrafficLightRender(this.scene),
      new TrafficSignalRender(this.scene),
      new CrosswalkRender(this.scene)
    ];

    this.preload().then(() => {
      this.registerModelRender();
    });
  }
  preload() {
    const preloadArray = [
      ObstacleRender,
      ParticipantRender,
      TrafficLightRender,
      TrafficSignalRender
    ];
    return Promise.allSettled(
      preloadArray.map((modelRender) => modelRender.preloading())
    );
  }

  registerModelRender() {
    for (const instance of this.createRender) {
      instance.topic.forEach((topic) => {
        VIEW_WS.registerTargetMsg(topic, instance.update.bind(instance));
      });
    }
  }
}

export default new ProRender();
