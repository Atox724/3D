/**
 * 利用自定义顺序 order 来计算深度
 * 顺序越小 深度越小
 * 同一顺序 深度递增 且不建议超过 maxIterations
 */
export class DepthTester {
  static BASE_DEPTH = 0.05;
  static STEP = 0.001;

  get #maxIterations() {
    return Math.floor(DepthTester.BASE_DEPTH / DepthTester.STEP);
  }

  #ordersCount: Map<number, Set<number>> = new Map();

  /**
   * 获取深度
   * @param order 顺序
   * @returns depth 深度值
   */
  getDepth(order: number): number {
    const depths = this.#ordersCount.get(order);
    if (depths) {
      const baseDepth = DepthTester.BASE_DEPTH * order;
      // 找到第一个空缺的深度
      for (let i = 0; ; i++) {
        const potentialDepth = baseDepth + i * DepthTester.STEP;
        if (!depths.has(potentialDepth)) {
          depths.add(potentialDepth);
          if (i >= this.#maxIterations) {
            const currentDepths = Array.from(depths);
            const actualMinDepth = currentDepths[0];
            const actualMaxDepth = currentDepths[currentDepths.length - 1];
            const maxDepth = baseDepth + this.#maxIterations * DepthTester.STEP;
            console.warn(
              `[DepthTester]: Order ${order} should have depths in range [${baseDepth}, ${maxDepth}). ` +
                `Currently, it has depths in range [${actualMinDepth}, ${actualMaxDepth}].`,
              depths
            );
          }
          return potentialDepth;
        }
      }
    } else {
      const depth = DepthTester.BASE_DEPTH * order;
      this.#ordersCount.set(order, new Set([depth]));
      return depth;
    }
  }

  /**
   * 删除深度
   * @param depth 深度
   * @param order 顺序
   */
  delete(depth: number, order: number) {
    const depths = this.#ordersCount.get(order);
    if (depths) {
      if (depths.size <= 1) {
        this.#ordersCount.delete(order);
      } else {
        depths.delete(depth);
      }
    }
  }
}

const DepthContainer = new DepthTester();
export default DepthContainer;
