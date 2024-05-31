import Renderer from "@/renderer";
import type BasicTarget from "@/renderer/basic_target";

import { VIEW_WS } from "../websocket";

class MachineReadableRenderer extends Renderer {
  createRender: BasicTarget[];
  constructor() {
    super();
    this.createRender = [];

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

export default new MachineReadableRenderer();
