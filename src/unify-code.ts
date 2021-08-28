import {RotateSpaceStore, CodeValidator, RotateSpace} from './types';

export class UnifyCode {
  key: string;
  length: number;
  step: number;
  max: number;
  __max: number;
  store: RotateSpaceStore;
  validator: CodeValidator;

  constructor(
    key: string,
    length: number,
    store: RotateSpaceStore,
    validator: CodeValidator,
    step?: number,
  ) {
    this.key = key;
    this.length = length;
    this.store = store;
    this.validator = validator;
    this.step = step ?? this.defaultStep();
    this.max = Math.pow(this.key.length, this.length);
    this.__max =
      this.max % this.step === 0
        ? this.max
        : this.max + this.step - (this.max % this.step);

    if (this.step >= this.max) {
      throw new Error('Step is bigger than Max.');
    }
  }

  async generate(): Promise<string> {
    const rotateSpace = await this.determineRotate(
      await this.store.getRotateSpace(),
    );
    const code = this.valueToCode(rotateSpace.code, this.key, this.length);
    await this.store.saveRotateSpace(rotateSpace);
    if (await this.validator.isValid(code)) return code;
    else return this.generate();
  }

  valueToCode(value: number, key: string, length: number) {
    let code = '';
    for (let i = 1; i <= length; i++) {
      const charIndex = value % key.length;
      value = (value - charIndex) / key.length;
      code = code + this.key.substr(charIndex, 1);
    }
    return code;
  }

  async determineRotate(rotateSpace: RotateSpace): Promise<RotateSpace> {
    if (rotateSpace == null) {
      rotateSpace = {
        rotate: 0,
        start: 0,
        code: 0,
      };
    }
    if (!rotateSpace.rotate) {
      rotateSpace.rotate = 1;
      this.newRotate(rotateSpace);
    } else {
      const _preCode = rotateSpace.code;
      rotateSpace.code = rotateSpace.code + this.step;
      if (
        _preCode < rotateSpace.start &&
        rotateSpace.code >= rotateSpace.start
      ) {
        if (rotateSpace.rotate + 1 > this.step) {
          throw new Error('Not enough code.');
        }
        rotateSpace.rotate = rotateSpace.rotate + 1;
        return this.newRotate(rotateSpace);
      }
      if (rotateSpace.code >= this.max && rotateSpace.code < this.__max) {
        rotateSpace.code = rotateSpace.code + this.step;
      }
      if (rotateSpace.code >= this.__max) {
        rotateSpace.code = rotateSpace.code % this.__max;
        if (rotateSpace.code >= rotateSpace.start) {
          if (rotateSpace.rotate + 1 > this.step) {
            throw new Error('Not enough code.');
          }
          rotateSpace.rotate = rotateSpace.rotate + 1;
          return this.newRotate(rotateSpace);
        }
      }
    }
    return rotateSpace;
  }

  private newRotate(rotateSpace: RotateSpace) {
    const start = ~~(this.max * Math.random()) ?? 1;
    if (start % this.step === 0) {
      rotateSpace.start = (start + rotateSpace.rotate - 1) % this.__max;
    } else {
      rotateSpace.start =
        (start + this.step - (start % this.step) + rotateSpace.rotate - 1) %
        this.__max;
    }
    if (rotateSpace.start > this.max) {
      rotateSpace.start = (rotateSpace.start + this.step) % this.__max;
    }
    rotateSpace.code = rotateSpace.start;
    return rotateSpace;
  }

  defaultStep(): number {
    const end = Math.pow(
      this.key.length <= 10 ? 10 : this.key.length,
      this.length - 1,
    );

    for (let i = end; i > 0; i--) {
      let isPrimeNumber = true;
      for (let j = 2; j < i; j++) {
        if (i % j === 0) {
          isPrimeNumber = false;
          break;
        }
      }
      if (isPrimeNumber) {
        return i;
      }
    }
    return end;
  }
}
