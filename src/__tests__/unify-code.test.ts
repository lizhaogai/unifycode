import {expect} from '@tib/testlab';
import {CodeValidator, RotateSpace, RotateSpaceStore, UnifyCode} from '../';

const niceCodes: string[] = [];

class VS implements RotateSpaceStore, CodeValidator {
  rotate: Map<string, RotateSpace> = new Map<string, RotateSpace>();

  async getRotateSpace(name: string): Promise<RotateSpace | null> {
    return this.rotate.get(name) ?? null;
  }

  async isValid(code: string): Promise<boolean> {
    return !niceCodes.includes(code.toUpperCase());
  }

  async saveRotateSpace(name: string, rotate: RotateSpace): Promise<void> {
    this.rotate.set(name, rotate);
  }
}

const key = 'abcdefghjkmnpqrstuvwxyz123456789';
const length = 5;
const name = 'test';

describe('Unify Code', () => {
  describe('generate', () => {
    it('code unique', async () => {
      const vs = new VS();
      const unifyCode = new UnifyCode(name, key, length, vs, vs, 199999);
      const result: number[] = [];
      for (let i = 0; i < Math.pow(key.length, length); i++) {
        await unifyCode.generate();
        const rotateSpace = await unifyCode.getRotateSpace();
        if (rotateSpace) result[rotateSpace.code] = rotateSpace.code;
      }
      for (let i = 0; i < Math.pow(key.length, length); i++) {
        expect(result[i]).to.equal(i);
      }
    }).timeout(600 * 1000);

    it('max===__max', async () => {
      const vs = new VS();
      const unifyCode = new UnifyCode(name, key, length, vs, vs, 256);
      const result: number[] = [];
      for (let i = 0; i < Math.pow(key.length, length); i++) {
        await unifyCode.generate();
        const rotateSpace = await unifyCode.getRotateSpace();
        if (rotateSpace) result[rotateSpace.code] = rotateSpace.code;
      }
      for (let i = 0; i < Math.pow(key.length, length); i++) {
        expect(result[i]).to.equal(i);
      }
    }).timeout(60 * 1000);

    it('max!==__max', async () => {
      const vs = new VS();
      const unifyCode = new UnifyCode(name, key, length, vs, vs, 289);
      const result: number[] = [];
      for (let i = 0; i < Math.pow(key.length, length); i++) {
        await unifyCode.generate();
        const rotateSpace = await unifyCode.getRotateSpace();
        if (rotateSpace) result[rotateSpace.code] = rotateSpace.code;
      }
      for (let i = 0; i < Math.pow(key.length, length); i++) {
        expect(result[i]).to.equal(i);
      }
    }).timeout(60 * 1000);

    it('not enough code', async () => {
      const vs = new VS();
      const unifyCode = new UnifyCode(name, key, length, vs, vs);
      try {
        for (let i = 0; i <= Math.pow(key.length, length); i++) {
          await unifyCode.generate();
        }
      } catch (e) {
        expect(e.message).to.equal('Not enough code.');
      }
    }).timeout(600 * 1000);

    it('nice code', async () => {
      const vs = new VS();
      const unifyCode = new UnifyCode(name, key, length, vs, vs, 256);
      await unifyCode.generate();
      let rotateSpace = await unifyCode.getRotateSpace();
      const flag = true;
      while (flag) {
        if ((rotateSpace?.code ?? 0) + unifyCode.step < unifyCode.max) {
          break;
        } else {
          await unifyCode.generate();
          rotateSpace = await unifyCode.getRotateSpace();
        }
      }

      const code = unifyCode.valueToCode(
        (rotateSpace?.code ?? 0) + unifyCode.step,
        unifyCode.key,
        unifyCode.length,
      );
      niceCodes.push(code.toUpperCase());
      const codeValue = await unifyCode.generate();
      expect(codeValue === code).equal(false);
    }).timeout(60 * 1000);
  });

  describe('determineRotate', () => {
    it('max == __max', async () => {
      const vs = new VS();
      const unifyCode = new UnifyCode(name, key, length, vs, vs, 256);
      let rotateSpace = {
        code: Math.pow(key.length, length) - 256 * 2,
        rotate: 1,
        start: 256 * 2,
        key,
        length,
        step: 256,
        name,
      };
      expect(rotateSpace.rotate).to.equal(1);
      rotateSpace = await unifyCode.determineRotate(rotateSpace);
      expect(rotateSpace.rotate).to.equal(1);
      expect(rotateSpace.code).to.equal(Math.pow(key.length, length) - 256);
      rotateSpace = await unifyCode.determineRotate(rotateSpace);
      expect(rotateSpace.rotate).to.equal(1);
      expect(rotateSpace.code).to.equal(0);
      rotateSpace = await unifyCode.determineRotate(rotateSpace);
      expect(rotateSpace.rotate).to.equal(1);
      expect(rotateSpace.code).to.equal(256);
      rotateSpace = await unifyCode.determineRotate(rotateSpace);
      expect(rotateSpace.rotate).to.equal(2);
    });

    it('max != __max', async () => {
      const vs = new VS();
      const unifyCode = new UnifyCode(name, key, length, vs, vs, 289);
      let rotateSpace = {
        code:
          Math.pow(key.length, length) -
          (Math.pow(key.length, length) % 289) -
          289 * 2 +
          10 -
          1,
        rotate: 10,
        start: 289 * 2 + 10 - 1,
        key,
        length,
        step: 289,
        name,
      };
      expect(rotateSpace.rotate).to.equal(10);
      rotateSpace = await unifyCode.determineRotate(rotateSpace);
      expect(rotateSpace.rotate).to.equal(10);
      expect(rotateSpace.code).to.equal(
        Math.pow(key.length, length) -
          (Math.pow(key.length, length) % 289) -
          289 * 1 +
          10 -
          1,
      );
      rotateSpace = await unifyCode.determineRotate(rotateSpace);
      expect(rotateSpace.rotate).to.equal(10);
      expect(rotateSpace.code).to.equal(
        Math.pow(key.length, length) -
          (Math.pow(key.length, length) % 289) -
          289 * 0 +
          10 -
          1,
      );

      rotateSpace = await unifyCode.determineRotate(rotateSpace);
      expect(rotateSpace.rotate).to.equal(10);
      expect(rotateSpace.code).to.equal(289 * 0 + 10 - 1);

      rotateSpace = await unifyCode.determineRotate(rotateSpace);
      expect(rotateSpace.rotate).to.equal(10);
      expect(rotateSpace.code).to.equal(289 * 1 + 10 - 1);

      rotateSpace = await unifyCode.determineRotate(rotateSpace);
      expect(rotateSpace.rotate).to.equal(10 + 1);
    });

    it('(max-1)%step=0', async () => {
      const vs = new VS();
      const unifyCode = new UnifyCode(name, 'abcdefg', 2, vs, vs, 12);
      let rotateSpace = {
        code: 36,
        rotate: 1,
        start: 24,
        key,
        length,
        step: 12,
        name,
      };
      rotateSpace = await unifyCode.determineRotate(rotateSpace);
      expect(rotateSpace.rotate).to.equal(1);
      expect(rotateSpace.code).to.equal(48);
      rotateSpace = await unifyCode.determineRotate(rotateSpace);
      expect(rotateSpace.rotate).to.equal(1);
      expect(rotateSpace.code).to.equal(0);
      rotateSpace = await unifyCode.determineRotate(rotateSpace);
      expect(rotateSpace.rotate).to.equal(1);
      expect(rotateSpace.code).to.equal(12);
      rotateSpace = await unifyCode.determineRotate(rotateSpace);
      expect(rotateSpace.rotate).to.equal(2);
    });
  });

  describe('valueToCode', () => {
    it('value to code generate', async () => {
      const vs = new VS();
      const _key = 'ABCD';
      const _length = 2;
      const unifyCode = new UnifyCode(name, _key, _length, vs, vs, 6);
      expect(unifyCode.valueToCode(0, _key, _length)).to.equal('AA');
      expect(unifyCode.valueToCode(1, _key, _length)).to.equal('BA');
      expect(unifyCode.valueToCode(2, _key, _length)).to.equal('CA');
      expect(unifyCode.valueToCode(3, _key, _length)).to.equal('DA');
      expect(unifyCode.valueToCode(4, _key, _length)).to.equal('AB');
      expect(unifyCode.valueToCode(5, _key, _length)).to.equal('BB');
      expect(unifyCode.valueToCode(6, _key, _length)).to.equal('CB');
      expect(unifyCode.valueToCode(7, _key, _length)).to.equal('DB');
      expect(unifyCode.valueToCode(8, _key, _length)).to.equal('AC');
      expect(unifyCode.valueToCode(9, _key, _length)).to.equal('BC');
      expect(unifyCode.valueToCode(10, _key, _length)).to.equal('CC');
      expect(unifyCode.valueToCode(11, _key, _length)).to.equal('DC');
      expect(unifyCode.valueToCode(12, _key, _length)).to.equal('AD');
      expect(unifyCode.valueToCode(13, _key, _length)).to.equal('BD');
      expect(unifyCode.valueToCode(14, _key, _length)).to.equal('CD');
      expect(unifyCode.valueToCode(15, _key, _length)).to.equal('DD');
    });
  });
});
