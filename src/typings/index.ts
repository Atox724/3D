import type { ALL_RENDER_MAP, ALL_TOPICS } from "@/constants";

export type MaybeArray<T> = T | T[];
export type PlayState = "loading" | "play" | "pause" | "end";

export namespace MessageType {
  export interface FileType {
    type: "files";
    data: File[];
  }
  export interface RequestType {
    type: "request";
    data: {
      url: string;
      params?: Record<string, any>;
    };
  }
  export interface PlayStateType {
    type: "playstate";
    data: {
      state: PlayState;
      currentDuration: number;
    };
  }
  export interface PlayRateType {
    type: "playrate";
    data: number;
  }
  export interface ResetType {
    type: "reset";
    data?: null;
  }
}

export namespace EventType {
  export interface PlayStateType {
    type: "playstatechange";
    data: PlayState;
  }
  export interface DurationType {
    type: "durationchange";
    data: {
      startTime: number;
      endTime: number;
    };
  }
  export interface TimeUpdateType {
    type: "timeupdate";
    data: number;
  }
  export interface DataType {
    type: "data";
    data: {
      topic: ALLTopicType;
      data: any;
    };
  }

  export interface LoadStateType {
    type: "loadstate";
    data: {
      state: "loadstart" | "loading" | "loadend";
      current: number;
      total: number;
    };
  }

  export type ALL =
    | PlayStateType
    | DurationType
    | TimeUpdateType
    | DataType
    | LoadStateType;
}

export namespace Replayer {
  export type OnMessage =
    | EventType.PlayStateType
    | EventType.DurationType
    | EventType.TimeUpdateType
    | EventType.DataType
    | EventType.LoadStateType;
  export type PostMessage =
    | MessageType.FileType
    | MessageType.RequestType
    | MessageType.PlayStateType
    | MessageType.PlayRateType
    | MessageType.ResetType
    | EventType.TimeUpdateType;
}

export namespace ReplayerWorker {
  export type OnMessage = Replayer.PostMessage;
  export type PostMessage = Replayer.OnMessage;
}

export namespace Request {
  export interface ResponseType {
    type: "response";
    data: {
      text: string;
      current: number;
      total: number;
    };
  }

  export interface ResponseFinishType {
    type: "finish";
    data?: null;
  }

  export type OnMessage =
    | EventType.DurationType
    | ResponseType
    | ResponseFinishType;
  export type PostMessage = MessageType.FileType | MessageType.RequestType;
}

export namespace RequestWorker {
  export type OnMessage = Request.PostMessage;
  export type PostMessage = Request.OnMessage;
}

export enum CameraMode {
  FOLLOW_EGOCAR,
  USER_CONTROL,
  BV_VERTICAL,
  BV_HORIZONTAL
}

export interface Point2 {
  x: number;
  y: number;
}

export interface UpdateDataTool<T> {
  data: T;
  defaultEnable: boolean;
  group: string;
  style: Record<string, any>;
  timestamp_nsec: number;
  topic: string;
}

export type ALLRenderType = keyof typeof ALL_RENDER_MAP;

export type ALLTopicType = (typeof ALL_TOPICS)[number];

export type TopicEvent = {
  [E in ALLTopicType]: (data: { topic: E; data: any }) => void;
};

export type EnableEvent = {
  enable: (data: {
    type: ALLRenderType;
    topic: ALLTopicType;
    enable: boolean;
  }) => void;
};
