class DepthTester {
  static BASE_DEPTH = 0.01;
  static STEP = 0.01;
  static MIN_INDEX_DEPTH = 0.001;
  static MAX_INDEX_DEPTH = 0.009;

  getDepth(order: number): number {
    if (order <= 1) return DepthTester.BASE_DEPTH;
    // The depth calculation based on the order, base depth, and step
    return DepthTester.BASE_DEPTH + (order - 1) * DepthTester.STEP;
  }

  getIndexDepth(order: number, index: number, totalItems: number): number {
    // Calculate the base depth for the given order
    const baseDepth = this.getDepth(order);

    // Define the minimum and maximum depth for the index range
    const minDepth = baseDepth + DepthTester.MIN_INDEX_DEPTH;
    const maxDepth = baseDepth + DepthTester.MAX_INDEX_DEPTH;

    // Calculate the depth for the given index within the range
    const depthRange = maxDepth - minDepth;
    const indexDepth = minDepth + (index / totalItems) * depthRange;

    return indexDepth;
  }

  getSubIndexDepth(
    order: number,
    index: number,
    totalItems: number,
    subIndex: number,
    totalSubItems: number
  ): number {
    // Calculate the depth for the given index within the order
    const indexDepth = this.getIndexDepth(order, index, totalItems);

    // Define the sub index range within the specific depth interval (MIN_INDEX_DEPTH to MAX_INDEX_DEPTH)
    const minSubDepth =
      indexDepth + DepthTester.MIN_INDEX_DEPTH / totalSubItems;
    const maxSubDepth =
      indexDepth + DepthTester.MAX_INDEX_DEPTH / totalSubItems;

    // Calculate the depth for the given subIndex within the sub range
    const subDepthRange = maxSubDepth - minSubDepth;
    const subIndexDepth =
      minSubDepth + (subIndex / totalSubItems) * subDepthRange;

    return subIndexDepth;
  }
}

const DepthContainer = new DepthTester();
export default DepthContainer;
