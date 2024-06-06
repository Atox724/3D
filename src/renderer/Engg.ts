import { VIEW_WS } from "@/utils/websocket";

import { Renderer } from "./BasicRender";
import type { Target } from "./BasicTarget";
import { CrosswalkRender, FreespaceRender } from "./modules";

class EnggRender extends Renderer {
  createRender: Target[];
  constructor() {
    super();
    this.createRender = [
      new FreespaceRender(this.scene),
      new CrosswalkRender(this.scene)
    ];

    this.registerModelRender();
  }

  registerModelRender() {
    for (const instance of this.createRender) {
      instance.topic.forEach((topic) => {
        VIEW_WS.registerTargetMsg(topic, instance.update.bind(instance));
      });
    }
  }
}

export default new EnggRender();
