export const CANVAS_ID = "canvas_id";

export const HZ = 60;

export enum PERCEPTION_RENDER_TOPIC {
  PERCEPTION_OBSTACLE_FUSION = "perception_obstacle_fusion",
  PERCEPTION_FUSION = "perception_fusion /perception/fusion/object",
  PERCEPTION_RADAR_FRONT = "perception_radar_front",

  PERCEPTION_CAMERA_FRONT = "perception_camera_front",
  PERCEPTION_CAMERA_NV = "perception_camera_nv",
  PERCEPTION_CAMERA_ROADLINES_CENTER_FOV30 = "perception_camera_roadlines center_camera_fov30",
  PERCEPTION_CAMERA_ROADLINES_CENTER_FOV120 = "perception_camera_roadlines center_camera_fov120",
  PERCEPTION_CAMERA_ROADLINES_NV = "perception_camera_roadlines nv_cameras",

  LOCALIZATION_GLOBAL_HISTORY_TRAJECTORY = "localization_global_history_trajectory",
  LOCALIZATION_LOCAL_HISTORY_TRAJECTORY = "localization_local_history_trajectory",

  MEMDRIVE_REF_ROUTE_TRAJECTORY = "memdrive_ref_route_trajectory",

  DPC_LFP_PLANNING_TRAJECTORY = "dpc_lfp_planning_trajectory",
  DPC_LFP_PLANNING_PLANLINE = "dpc_lfp_planning_planline",
  DPC_PLANNING_DEBUG_INFO = "dpc_planning_debug_info",
  DPC_PLANNING_OTHERLINE = "dpc_planning_otherline",
  DPC_PLANNING_REFERENCE_LINE = "dpc_planning_reference_line",
  DPC_PLANNING_EDGELINE = "dpc_planning_edgeline",

  LOCALMAP_SPEEDBUMP = "localmap_speedbump",
  LOCALMAP_CENTER_LINE = "localmap_center_line",
  LOCALMAP_LANE_LINE = "localmap_lane_line",
  LOCALMAP_STOP_LINE = "localmap_stop_line",
  LOCALMAP_MAP_LINE_ID = "localmap_map_line_id",
  LOCALMAP_MAP_LANE_ID = "localmap_map_lane_id",
  LOCALMAP_CROSSWALK = "localmap_crosswalk",
  LOCALMAP_LANE_LANE = "localmap_lane_lane"
}

export enum PILOTHMI_RENDER_TOPIC {
  PILOTHMI_CROSS_WALK = "pilothmi_cross_walk",
  PILOTHMI_CROSS_WALK_LOCAL = "pilothmi_cross_walk_local",

  PILOTHMI_LANE_LINE = "pilothmi_lane_line",

  PILOTHMI_PERCEPTION_OBSTACLE_FUSION_OBJECT = "pilothmi_perception_obstacle_fusion_object",
  PILOTHMI_PERCEPTION_OBSTACLE_LOCAL = "pilothmi_perception_obstacle_local",

  PILOTHMI_PERCEPTION_TRAFFIC_PARTICIPANT_FUSION_OBJECT = "pilothmi_perception_traffic_participant_fusion object",

  PILOTHMI_LANE_LINES = "pilothmi_lane_lines",
  PILOTHMI_STOP_LINE = "pilothmi_stop_line",
  PILOTHMI_PLANNING_LINES_INFO = "pilothmi_planning_lines_info",
  PILOTHMI_PILOT_PLANNING_TRAJECTORY = "pilothmi_pilot_planning_trajectory",

  PILOTHMI_TRAFFIC_LIGHT_LOCAL = "pilothmi_traffic_light_local",

  PILOTHMI_TRAFFIC_SIGN_LOCAL = "pilothmi_traffic_sign_local"
}
