// Type definitions for @pnext/three-loader (Potree loader for Three.js)
declare module '@pnext/three-loader' {
  export class Potree {
    pointBudget: number;
    loadPointCloud(name: string, url: string): Promise<any>;
    updatePointClouds(pointClouds: any[], camera: any, renderer: any): void;
  }
}

// Keep old module declaration for backwards compatibility if needed
declare module 'potree-loader' {
  export class Potree {
    pointBudget: number;
    loadPointCloud(name: string, url: string): Promise<any>;
    updatePointClouds(pointClouds: any[], camera: any, renderer: any): void;
  }
}
