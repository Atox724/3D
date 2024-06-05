export type PlayState = "play" | "pause" | "loading";

export namespace LocalWorker {
  export namespace OnMessage {
    export interface DataType {
      type: "file";
      data: FileList;
    }
    interface PlayType {
      type: "play";
      data?: {
        currentDuration: number;
      };
    }
    interface PauseType {
      type: "pause";
      data?: undefined;
    }
    interface RateType {
      type: "rate";
      data: {
        speed: number;
      };
    }
    interface TimeUpdateType {
      type: "timeupdate";
      data: {
        currentDuration: number;
      };
    }
    export type EventType = PlayType | PauseType | RateType | TimeUpdateType;
    export type Type = DataType | EventType;
  }

  export namespace PostMessage {
    export interface TimeType {
      type: "time";
      data: {
        startTime: number;
        endTime: number;
      };
    }
    export interface DataType {
      type: "data";
      data: {
        topic: string;
        data: any;
      };
    }
    interface PlayStateType {
      type: "playState";
      data: {
        state: PlayState;
      };
    }
    interface TimeUpdateType {
      type: "timeupdate";
      data: {
        currentDuration: number;
      };
    }
    export type EventType = PlayStateType | TimeUpdateType;

    export type Type = TimeType | DataType | EventType;
  }
}

export namespace RemoteWorker {
  export namespace OnMessage {
    export interface DataType {
      type: "data";
      data: string;
    }
    interface PlayType {
      type: "play";
      data?: {
        currentDuration: number;
      };
    }
    interface PauseType {
      type: "pause";
      data?: undefined;
    }
    interface RateType {
      type: "rate";
      data: {
        speed: number;
      };
    }
    interface TimeUpdateType {
      type: "timeupdate";
      data: {
        currentDuration: number;
      };
    }
    export type EventType = PlayType | PauseType | RateType | TimeUpdateType;
    export type Type = DataType | EventType;
  }

  export namespace PostMessage {
    export interface TimeType {
      type: "time";
      data: {
        startTime: number;
        endTime: number;
      };
    }
    export interface DataType {
      type: "data";
      data: {
        topic: string;
        data: any;
      };
    }
    interface PlayStateType {
      type: "playState";
      data: {
        state: PlayState;
      };
    }
    interface TimeUpdateType {
      type: "timeupdate";
      data: {
        currentDuration: number;
      };
    }
    export type EventType = PlayStateType | TimeUpdateType;

    export type Type = TimeType | DataType | EventType;
  }
}

export type MaybeArray<T> = T | T[];
