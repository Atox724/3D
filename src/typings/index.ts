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
      topic: string;
      data: any[];
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

export namespace Local {
  export type OnMessage =
    | EventType.PlayStateType
    | EventType.DurationType
    | EventType.TimeUpdateType
    | EventType.DataType
    | EventType.LoadStateType;
  export type PostMessage =
    | MessageType.FileType
    | MessageType.PlayStateType
    | MessageType.PlayRateType
    | EventType.TimeUpdateType;
}

export namespace LocalWorker {
  export type OnMessage = Local.PostMessage;
  export type PostMessage = Local.OnMessage;
}

export namespace Remote {
  export type OnMessage =
    | EventType.PlayStateType
    | EventType.DurationType
    | EventType.TimeUpdateType
    | EventType.DataType
    | EventType.LoadStateType;
  export type PostMessage =
    | MessageType.RequestType
    | MessageType.PlayStateType
    | MessageType.PlayRateType
    | EventType.TimeUpdateType;
}

export namespace RemoteWorker {
  export type OnMessage = Remote.PostMessage;
  export type PostMessage = Remote.OnMessage;
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
  export type PostMessage = MessageType.RequestType;
}

export namespace RequestWorker {
  export type OnMessage = Request.PostMessage;
  export type PostMessage = Request.OnMessage;
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
