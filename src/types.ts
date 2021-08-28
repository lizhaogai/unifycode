export interface RotateSpaceStore {
  saveRotateSpace(rotateSpace: RotateSpace): Promise<void>;

  getRotateSpace(): Promise<RotateSpace>;
}

export type RotateSpace = {
  code: number;
  rotate: number;
  start: number;
};

export interface CodeValidator {
  isValid(code: string): Promise<boolean>;
}
