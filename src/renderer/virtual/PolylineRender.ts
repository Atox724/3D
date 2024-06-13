import LineRender from "@/renderer/public/LineRender";

interface DataType {
  color: { r: number; g: number; b: number };
  lineType: number;
  polyline: {
    color: { r: number; g: number; b: number; a: number };
    colorEnable: boolean;
    x: number;
    y: number;
  }[];
  width: number;
}

interface UpdateData {
  data: DataType[];
  defaultEnable: boolean;
  group: string;
  style: Record<string, any>;
  timestamp_nsec: number;
  topic: string;
  type: "polyline";
}

export default class PolylineRender extends LineRender {
  topic = ["dpc_planning_debug_info", "perception_camera_roadlines"];

  update(data: UpdateData) {
    super.update(data);
  }
}
