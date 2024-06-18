const getCall = () => {
  const stack = new Error().stack;
  if (stack) {
    const callArr = stack.split("\n");
    if (callArr.length > 3) {
      return callArr[3].trim();
    }
  }
};

export class DepthTester {
  static BASE_DEPTH = 0.05;
  static STEP = 0.002;

  order = 0;

  getDepth(order?: number): number {
    if (order !== undefined && order < this.order) {
      const caller = getCall();
      console.warn("order is used:", caller);
    }
    return DepthTester.BASE_DEPTH + this.order++ * DepthTester.STEP;
  }
}

const DepthContainer = new DepthTester();
export default DepthContainer;
