import {expect} from '@tib/testlab';
import {CodeValidator, Rotate, RotateStore, UnifyCode} from '../';

class VS implements RotateStore, CodeValidator {
  rotate: Rotate;

  async getRotate(): Promise<Rotate> {
    return this.rotate;
  }

  isValid(code: string): boolean {
    return true;
  }

  setRotate(rotate: Rotate): void {
    this.rotate = rotate;
  }
}

describe('Unify Code', () => {
  it('Generate', async () => {
    const vs = new VS();
    const key = 'abcdefghjkmnpqrs';
    const length = 4;
    const unifyCode = new UnifyCode(key, length, vs, vs);
    const result: string[] = [];
    for (let i = 0; i < Math.pow(key.length, length); i++) {
      const code = await unifyCode.generate();
      result.push(code);
    }
    expect(result.length).to.equal(Math.pow(key.length, length));
  });
});
