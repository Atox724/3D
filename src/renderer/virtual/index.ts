import { VIEW_WS } from "@/utils/websocket";

import Renderer from "../renderer";
import type Target from "../target";
import ArrowRender from "./ArrowRender";
import BoxRender from "./BoxRender";
import CrosswalkRender from "./CrosswalkRender";
import FreespaceRender from "./FreespaceRender";
import PolygonRender from "./PolygonRender";
import PolylineRender from "./PolylineRender";
import TextRender from "./TextRender";

export default class Virtual extends Renderer {
  createRender: Target[];

  ips: string[] = [];

  constructor() {
    super();
    this.createRender = [
      new FreespaceRender(this.scene),
      new CrosswalkRender(this.scene),
      new ArrowRender(this.scene),
      new BoxRender(this.scene),
      new PolylineRender(this.scene),
      new PolygonRender(this.scene),
      new TextRender(this.scene)
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
