/// <reference types="vite/client" />

interface Window {
  performance: Performance & {
    memory?: {
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
      usedJSHeapSize: number;
    };
  };
}

declare const __COMMITID__: string;

declare module "*.vue" {
  import { ComponentOptions } from "vue";
  const componentOptions: ComponentOptions;
  export default componentOptions;
}

declare module "*.gltf" {
  const value: string;
  export default value;
}
