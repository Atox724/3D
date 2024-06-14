import { FreespaceRender, type FreespaceUpdateData } from "@/renderer/public";

export default class LaneRender extends FreespaceRender {
  topic: readonly string[] = ["pilothmi_lane_line"];
  update(data: FreespaceUpdateData[]) {
    super.update(data);
  }
}
