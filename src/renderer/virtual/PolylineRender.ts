import { LineRender, type LineUpdateData } from "@/renderer/public";

export default class PolylineRender extends LineRender {
  topic: readonly string[] = [
    "dpc_planning_debug_info",
    "perception_camera_roadlines center_camera_fov30",
    "perception_camera_roadlines center_camera_fov120",
    "perception_camera_roadlines nv_cameras",
    "localmap_center_line",
    "localmap_lane_line",
    "localmap_stop_line"
  ];
  update(data: LineUpdateData) {
    super.update(data);
  }
}
