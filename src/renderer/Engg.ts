import { VIEW_WS } from "@/utils/websocket";

import { Renderer } from "./BasicRender";
import type { Target } from "./BasicTarget";
import { BoxTargetRender, CrosswalkRender, FreespaceRender } from "./modules";

class EnggRender extends Renderer {
  createRender: Target[];

  ips: string[] = [];

  constructor() {
    super();
    this.createRender = [
      new FreespaceRender(this.scene),
      new CrosswalkRender(this.scene),
      new BoxTargetRender(this.scene)
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

export default new EnggRender();
