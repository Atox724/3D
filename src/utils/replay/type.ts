export type MaybeArray<T> = T | T[];
export type PlayState = "play" | "pause" | "loading";

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
      currentDuration?: number;
    };
  }
  export interface RateType {
    type: "rate";
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
    data: {
      currentDuration: number;
    };
  }
  export interface DataType {
    type: "data";
    data: {
      topic: string;
      data: any;
    };
  }

  export interface FileType {
    type: "files";
    data: File[];
  }

  export type ALL =
    | EventType.PlayStateType
    | EventType.DurationType
    | EventType.TimeUpdateType
    | EventType.DataType
    | EventType.FileType;
}

export namespace Local {
  export type OnMessage =
    | EventType.PlayStateType
    | EventType.DurationType
    | EventType.TimeUpdateType
    | EventType.DataType;
  export type PostMessage =
    | MessageType.FileType
    | MessageType.PlayStateType
    | MessageType.RateType
    | EventType.TimeUpdateType;
}

export namespace LocalWorker {
  export type OnMessage =
    | MessageType.FileType
    | MessageType.PlayStateType
    | MessageType.RateType
    | EventType.TimeUpdateType;
  export type PostMessage =
    | EventType.PlayStateType
    | EventType.DurationType
    | EventType.TimeUpdateType
    | EventType.DataType;
}

export namespace Remote {
  export type OnMessage =
    | EventType.PlayStateType
    | EventType.DurationType
    | EventType.TimeUpdateType
    | EventType.DataType;
  export type PostMessage =
    | MessageType.RequestType
    | MessageType.PlayStateType
    | MessageType.RateType
    | EventType.TimeUpdateType;
}

export namespace RemoteWorker {
  export type OnMessage =
    | MessageType.RequestType
    | MessageType.PlayStateType
    | MessageType.RateType
    | EventType.TimeUpdateType;
  export type PostMessage =
    | EventType.PlayStateType
    | EventType.DurationType
    | EventType.TimeUpdateType
    | EventType.DataType;
}

export namespace RequestWorker {
  interface FileType {
    type: "file";
    data: {
      file: File;
      current: number;
      total: number;
    };
  }
  export type OnMessage = MessageType.RequestType;
  export type PostMessage = EventType.DurationType | FileType;
}
