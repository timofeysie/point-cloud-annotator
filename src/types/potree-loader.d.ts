declare module 'potree-loader' {
  export class Potree {
    pointBudget: number;
    loadPointCloud(name: string, url: string): Promise<any>;
    updatePointClouds(pointClouds: any[], camera: any, renderer: any): void;
  }
}
