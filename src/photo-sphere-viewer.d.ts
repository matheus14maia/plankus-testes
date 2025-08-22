declare module 'photo-sphere-viewer' {
    export default class PhotoSphereViewer {
      constructor(options: any);
      setPanorama(panorama: string): void;
      destroy(): void;
    }
  }
  