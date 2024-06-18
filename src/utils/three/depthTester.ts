export class DepthTester {
  static BASE_DEPTH = 0.05;
  static STEP = 0.002;

  order = 0;

  getDepth(): number {
    return DepthTester.BASE_DEPTH + this.order++ * DepthTester.STEP;
  }
}

const DepthContainer = new DepthTester();
export default DepthContainer;
