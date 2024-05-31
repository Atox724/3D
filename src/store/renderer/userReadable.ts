import Renderer from "@/renderer";
import type BasicTarget from "@/renderer/basic_target";
import {
  CrosswalkRender,
  FreespaceRender,
  ObstacleRender,
  ParticipantRender,
  TrafficLightRender,
  TrafficSignalRender
} from "@/renderer/modules";

import { VIEW_WS } from "../websocket";

class UserReadableRenderer extends Renderer {
  createRender: BasicTarget[];

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

export default new UserReadableRenderer();
