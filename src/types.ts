export interface RotateStore {
  setRotate(rotate: Rotate): Promise<void>;

  getRotate(): Promise<Rotate>;
}

export type Rotate = {
  code: number;
  rotate: number;
  start: number;
};

export interface CodeValidator {
  isValid(code: string): Promise<boolean>;
}
