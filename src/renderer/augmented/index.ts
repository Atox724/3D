import { VIEW_WS } from "@/utils/websocket";

import { CrosswalkRender } from "../public";
import Renderer from "../renderer";
import type Target from "../target";
import LaneRender from "./LaneRender";
import ObstacleRender from "./ObstacleRender";
import ParticipantRender from "./ParticipantRender";
import TrafficLightRender from "./TrafficLightRender";
import TrafficSignalRender from "./TrafficSignalRender";

export default class Augmented extends Renderer {
  createRender: Target[];

  ips: string[] = [];

  constructor() {
    super();
    this.createRender = [
      new ObstacleRender(this.scene),
      new ParticipantRender(this.scene),
      new LaneRender(this.scene),
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
    VIEW_WS.registerTargetMsg("conn_list", (data: { conn_list?: string[] }) => {
      this.ips = data.conn_list || [];
    });
  }
}
