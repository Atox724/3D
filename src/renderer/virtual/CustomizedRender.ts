import type { Scene } from "three";

import Target from "@/renderer/target";

import ArrowRender from "./ArrowRender";
import BoxRender from "./BoxRender";
import PolygonRender from "./PolygonRender";
import PolylineRender from "./PolylineRender";

/**
 * topicMap
 * {
 *    // 父级topic
 *    parent_topic: {
 *      // value.value0中所有的属性键名: 属性自身的topic
 *      [k: string]: self_topic,
 *    }
 * }
 */
// const topicMap = {
//   dpc_planning_debug_info: {
//     box_array: "dpc_stopline",
//     polyline_array: "dpc_planning_debug_info"
//   },
//   perception_obstacle_fusion: {
//     arrow_array: "perception_obstacle_fusion_arrow",
//     box_target_array: "perception_obstacle_fusion",
//     polygon_array: ""
//   },
//   "perception_fusion /perception/fusion/object": {
//     arrow_array: "perception_fusion_arrow",
//     box_target_array: "perception_fusion",
//     polygon_array: "perception_fusion_polygon"
//   },
//   perception_radar_front: {
//     arrow_array: "perception_radar_front_arrow",
//     box_target_array: "perception_radar_front"
//   },
//   "perception_camera_roadlines center_camera_fov30": {
//     polyline: "perception_camera_roadlines"
//   },
//   "perception_camera_roadlines center_camera_fov120": {
//     polyline: "perception_camera_roadlines"
//   },
//   perception_camera_front: {
//     arrow_array: "perception_camera_arrow",
//     box_target_array: "perception_camera_target",
//     polygon_array: ""
//   },
//   "perception_camera_roadlines nv_cameras": {
//     polyline: "perception_camera_roadlines"
//   },
//   perception_camera_nv: {
//     arrow_array: "perception_camera_arrow",
//     box_target_array: "perception_camera_target",
//     polygon_array: ""
//   }
// };

const topic = [
  "dpc_planning_debug_info",
  "perception_obstacle_fusion",
  "perception_fusion /perception/fusion/object",
  "perception_radar_front",
  "perception_camera_roadlines center_camera_fov30",
  "perception_camera_roadlines center_camera_fov120",
  "perception_camera_front",
  "perception_camera_roadlines nv_cameras",
  "perception_camera_nv"
] as const;
type TopicType = (typeof topic)[number];

export default class CustomizedRender extends Target {
  topic = topic;

  createRender: Record<TopicType, { [k: string]: Target }>;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      dpc_planning_debug_info: {
        box_array: new BoxRender(scene),
        polyline_array: new PolylineRender(scene)
      },
      perception_obstacle_fusion: {
        arrow_array: new ArrowRender(scene),
        box_target_array: new BoxRender(scene)
        // polygon_array: ""
      },
      "perception_fusion /perception/fusion/object": {
        arrow_array: new ArrowRender(scene),
        box_target_array: new BoxRender(scene),
        polygon_array: new PolygonRender(scene)
      },
      perception_radar_front: {
        arrow_array: new ArrowRender(scene),
        box_target_array: new BoxRender(scene)
      },
      "perception_camera_roadlines center_camera_fov30": {
        polyline: new PolylineRender(scene)
      },
      "perception_camera_roadlines center_camera_fov120": {
        polyline: new PolylineRender(scene)
      },
      perception_camera_front: {
        arrow_array: new ArrowRender(scene),
        box_target_array: new BoxRender(scene)
        // polygon_array: ""
      },
      "perception_camera_roadlines nv_cameras": {
        polyline: new PolylineRender(scene)
      },
      perception_camera_nv: {
        arrow_array: new ArrowRender(scene),
        box_target_array: new BoxRender(scene)
        // polygon_array: ""
      }
    };
  }

  update(data: Record<string, any>, topic: TopicType) {
    for (const key in data) {
      this.createRender[topic]?.[key]?.update(data[key]);
    }
  }
}
