import { FreespaceRender, type FreespaceUpdateData } from "@/renderer/public";

/**
 * 车道
 */
export default class LaneRender extends FreespaceRender {
  topic: readonly string[] = ["localmap_lane_lane"];
  update(data: FreespaceUpdateData[]) {
    super.update(data);
  }
}
