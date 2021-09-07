export interface RotateSpaceStore {
  saveRotateSpace(name: string, rotateSpace: RotateSpace): Promise<void>;

  getRotateSpace(name: string): Promise<RotateSpace | null>;
}

export type RotateSpace = {
  name: string;
  code: number;
  rotate: number;
  start: number;
  key: string;
  length: number;
  step: number;
};

export type UnifyCodeConfig = {
  name: string;
  key: string;
  length: number;
  step: number;
  store: {
    host?: string;
    db?: number;
  };
};

export interface CodeValidator {
  isValid(code: string): Promise<boolean>;
}

export interface Lock {
  unlock(): Promise<void>;
}

export interface LockGenerator {
  lock(resource: string, timeout: number): Promise<Lock>;
}
