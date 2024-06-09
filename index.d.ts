/// <reference types="vite/client" />

interface Memory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface Window {
  performance: Performance & {
    memory?: Memory;
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
