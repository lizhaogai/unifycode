import {RotateStore, CodeValidator, Rotate} from './types';

export class UnifyCode {
  key: string;
  length: number;
  step: number;
  max: number;
  __max: number;
  store: RotateStore;
  validator: CodeValidator;

  constructor(
    key: string,
    length: number,
    store: RotateStore,
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
    const rotate = await this.determineRotate();
    let codeValue = rotate.code;
    let code = '';
    for (let i = 1; i <= this.length; i++) {
      const charIndex = codeValue % this.key.length;
      codeValue = (codeValue - charIndex) / this.key.length;
      code = code + this.key.substr(charIndex, 1);
    }
    await this.store.setRotate(rotate);
    if (await this.validator.isValid(code)) return code;
    else return this.generate();
  }

  async determineRotate(): Promise<Rotate> {
    let rotate = await this.store.getRotate();
    if (rotate == null) {
      rotate = {
        rotate: 0,
        start: 0,
        code: 0,
      };
    }
    if (!rotate.rotate) {
      rotate.rotate = 1;
      this.newRotate(rotate);
    } else {
      const _preCode = rotate.code;
      rotate.code = rotate.code + this.step;
      if (_preCode < rotate.start && rotate.code >= rotate.start) {
        if (rotate.rotate + 1 > this.step) {
          throw new Error('Not enough code.');
        }
        rotate.rotate = rotate.rotate + 1;
        this.newRotate(rotate);
      } else {
        if (
          rotate.code > this.max &&
          this.max !== this.__max &&
          rotate.code <= this.__max
        ) {
          rotate.code = rotate.code + this.step;
        }
        if (rotate.code >= this.__max) {
          rotate.code = rotate.code % this.__max;
          if (rotate.code >= rotate.start) {
            if (rotate.rotate + 1 > this.step) {
              throw new Error('Not enough code.');
            }
            rotate.rotate = rotate.rotate + 1;
            this.newRotate(rotate);
          }
        }
      }
    }
    return rotate;
  }

  private newRotate(rotate: Rotate) {
    const start = ~~(this.max * Math.random()) ?? 1;
    if (start % this.step === 0) {
      rotate.start = (start + rotate.rotate - 1) % this.__max;
    } else {
      rotate.start =
        (start + this.step - (start % this.step) + rotate.rotate - 1) %
        this.__max;
    }
    if (rotate.start > this.max) {
      rotate.start = (rotate.start + this.step) % this.__max;
    }
    rotate.code = rotate.start;
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
