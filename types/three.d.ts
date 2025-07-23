declare module 'three' {
  export * from '@types/three';
}

declare module 'three/examples/jsm/*' {
  const content: any;
  export default content;
}
