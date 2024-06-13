import {
  ObstacleRender,
  ParticipantRender,
  TrafficLightRender,
  TrafficSignalRender
} from "@/renderer/augmented";
import { CrosswalkRender, FreespaceRender } from "@/renderer/public";
import Renderer from "@/renderer/renderer";
import type Target from "@/renderer/target";
import { VIEW_WS } from "@/utils/websocket";

class Virtual extends Renderer {
  createRender: Target[];

  ips: string[] = [];

  constructor() {
    super();
    this.createRender = [
      new FreespaceRender(this.scene),
      new CrosswalkRender(this.scene)
      // new BoxTargetRender(this.scene)
    ];

    this.registerModelRender();
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

class Augmented extends Renderer {
  createRender: Target[];

  ips: string[] = [];

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
    VIEW_WS.registerTargetMsg("conn_list", (data: { conn_list?: string[] }) => {
      this.ips = data.conn_list || [];
    });
  }
}

export { Augmented, Virtual };
