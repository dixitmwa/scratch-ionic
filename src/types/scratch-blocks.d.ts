// Works for import ScratchBlocks from 'scratch-blocks';
declare module 'scratch-blocks' {
  const ScratchBlocks: any;          // inject(), Xml, Blocks, ...
  export = ScratchBlocks;            // CommonJS export=
}
