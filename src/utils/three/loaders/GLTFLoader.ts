import { AnimationClip, Camera, Group, ObjectLoader } from "three";
import {
  type GLTF,
  GLTFLoader as BASE_GLTFLoader
} from "three/examples/jsm/loaders/GLTFLoader";

import useCache from "@/utils/cache";

const loader = new ObjectLoader();

const cache = useCache({
  name: "gltf-cache",
  storeName: "models"
});

// 序列化 GLTF 对象
function serializeGLTF(gltf: GLTF) {
  return {
    animations: gltf.animations.map(AnimationClip.toJSON),
    scene: gltf.scene.toJSON(),
    scenes: gltf.scenes.map((scene) => scene.toJSON()),
    cameras: gltf.cameras.map((camera) => camera.toJSON()),
    asset: gltf.asset,
    userData: gltf.userData
  };
}

// 反序列化 GLTF 对象
function deserializeGLTF(gltf: GLTF) {
  return {
    animations: gltf.animations.map(AnimationClip.parse.bind(AnimationClip)),
    scene: loader.parse(gltf.scene) as Group,
    scenes: gltf.scenes.map((scene) => loader.parse(scene) as Group),
    cameras: gltf.cameras.map((camera) => loader.parse(camera) as Camera),
    asset: gltf.asset,
    userData: gltf.userData
  };
}

export default class GLTFLoader extends BASE_GLTFLoader {
  #retry = 0;
  #MAX_RETRY = 3;

  load(
    url: string,
    onLoad: (data: GLTF) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void
  ) {
    this.manager.itemStart(url);
    if (this.#retry > this.#MAX_RETRY) {
      this.#retry = 0;
      onError?.call(this, new Error("retry too many times"));
      this.manager.itemError(url);
      this.manager.itemEnd(url);

      return;
    }
    cache.get<GLTF>(url, (err, data) => {
      if (err) {
        cache.remove(url, (e) => {
          this.manager.itemEnd(url);
          if (e) {
            this.#retry = 0;
            onError?.call(this, e);
          } else {
            this.#retry++;
            this.load(url, onLoad, onProgress, onError);
          }
        });
      } else if (data) {
        this.#retry = 0;
        this.manager.itemEnd(url);
        const gltf = deserializeGLTF(data);
        onLoad(gltf as GLTF);
      } else {
        super.load(
          url,
          (gltf) => {
            this.#retry = 0;
            this.manager.itemEnd(url);
            onLoad(gltf);
            const g = serializeGLTF(gltf);
            cache.add(url, g);
          },
          onProgress,
          () => {
            this.manager.itemEnd(url);
            this.#retry++;
            this.load(url, onLoad, onProgress, onError);
          }
        );
      }
    });
  }

  loadAsync(
    url: string,
    onProgress?: ((event: ProgressEvent<EventTarget>) => void) | undefined
  ): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      this.load(url, resolve, onProgress, reject);
    });
  }
}
