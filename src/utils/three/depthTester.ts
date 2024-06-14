const base_trajectory_pos_z = 0.05;
const step_z = 0.002;

class DepthTester {
  capacity: number;
  available: number[];

  get base_trajectory_pos_z() {
    return base_trajectory_pos_z;
  }

  get step_z() {
    return step_z;
  }

  constructor(capacity: number) {
    this.capacity = Math.max(capacity, 20);
    this.available = [];
    for (let i = 0; i < this.capacity; ++i) {
      this.available.push(base_trajectory_pos_z + i * step_z);
    }
  }

  queryDepth() {
    if (this.available.length === 0) {
      return base_trajectory_pos_z;
    }
    return this.available.shift()!;
  }
}

const DepthContainer = new DepthTester(20);
export default DepthContainer;
