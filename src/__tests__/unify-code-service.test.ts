import {expect} from '@tib/testlab';
import {MyApplication, setupApplication} from './test-helper.test';
import {UnifyCodeBindings} from '../keys';
import {UnifyCodeService} from '../unify-code-service';

describe('Unify Code Service', () => {
  let app: MyApplication;
  before('setupApplication', async () => {
    console.time('time');
    app = await setupApplication();
    const service: UnifyCodeService = app.getSync(UnifyCodeBindings.SERVICE);
    await new Promise(function (resolve) {
      setTimeout(function () {
        resolve(1);
      }, 1000);
    });
    await service.bucket.del(
      service.uniFyCode.name + '_' + service.uniFyCode.length,
    );
  });

  after('', async () => {});

  describe('generate', () => {
    it('code unique', async () => {
      const service: UnifyCodeService = app.getSync(UnifyCodeBindings.SERVICE);
      const result: number[] = [];
      for (
        let i = 0;
        i < Math.pow(service.uniFyCode.key.length, service.uniFyCode.length);
        i++
      ) {
        await service.generate();
        const rotateSpace = await service.uniFyCode.getRotateSpace();
        if (rotateSpace) result[rotateSpace.code] = rotateSpace.code;
      }
      for (
        let i = 0;
        i < Math.pow(service.uniFyCode.key.length, service.uniFyCode.length);
        i++
      ) {
        expect(result[i]).to.equal(i);
      }
    }).timeout(60 * 1000);
  });
});
