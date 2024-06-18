import type { ALLRenderType, ALLTopicType } from "@/typings";

import Target from "./target";

export default abstract class Render {
  abstract type: ALLRenderType;

  abstract createRender: {
    [key in ALLTopicType]?: Target;
  };

  dispose() {
    let topic: keyof typeof this.createRender;
    for (topic in this.createRender) {
      this.createRender[topic]?.dispose();
    }
    this.createRender = {};
  }
}
