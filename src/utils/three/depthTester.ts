export class DepthTester {
  static BASE_DEPTH = 0.01;
  static STEP = 0.01;

  getDepth(order: number): number {
    if (order <= 1) return DepthTester.BASE_DEPTH;
    return DepthTester.BASE_DEPTH + (order - 1) * DepthTester.STEP;
  }

  getIndexDepth(order: number, index: number, totalItems: number): number {
    const depth = this.getDepth(order);
    const nextDepth = this.getDepth(order + 1);
    const increment = (nextDepth - depth) / totalItems;
    return depth + increment * Math.min(index, totalItems - 1);
  }

  getSubIndexDepth(
    order: number,
    index: number,
    totalItems: number,
    subIndex: number,
    totalSubItems: number
  ): number {
    const indexDepth = this.getIndexDepth(order, index, totalItems);
    const nextIndexDepth = this.getIndexDepth(order, index + 1, totalItems);
    const increment = (nextIndexDepth - indexDepth) / totalSubItems;
    return indexDepth + increment * Math.min(subIndex, totalSubItems - 1);
  }
}

const DepthContainer = new DepthTester();
export default DepthContainer;
