import Target from "./target";

export default abstract class Render {
  abstract createRender: Record<string, Record<string, Target> | Target>;

  dispose() {
    for (const topic in this.createRender) {
      const renderItem = this.createRender[topic];

      if (renderItem instanceof Target) {
        renderItem.dispose();
      } else {
        for (const key in renderItem) {
          const target = renderItem[key];
          if (target instanceof Target) {
            target.dispose();
          }
        }
      }
    }
    this.createRender = {};
  }
}
