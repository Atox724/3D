import { VIEW_WS } from "@/utils/websocket";

import { CrosswalkRender } from "../public";
import Renderer from "../renderer";
import type Target from "../target";
import CustomizedRender from "./CustomizedRender";
import LaneLineRender from "./LaneLineRender";
import LaneRender from "./LaneRender";

export default class Virtual extends Renderer {
  createRender: Target[];

  ips: string[] = [];

  constructor() {
    super();
    this.createRender = [
      new LaneRender(this.scene),
      new CrosswalkRender(this.scene),
      new CustomizedRender(this.scene),
      new LaneLineRender(this.scene)
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
