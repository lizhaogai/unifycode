import {bind, BindingScope, ContextTags, inject, Context} from '@loopback/core';
import {UnifyCodeBindings} from './keys';
import {
  CodeValidator,
  LockGenerator,
  RotateSpace,
  RotateSpaceStore,
  UnifyCodeConfig,
} from './types';
import {Store, Bucket} from 'kvs';
import {UnifyCode} from './unify-code';

@bind({
  scope: BindingScope.SINGLETON,
  tags: {[ContextTags.KEY]: UnifyCodeBindings.SERVICE},
})
export class UnifyCodeService implements RotateSpaceStore, CodeValidator {
  store: Store;
  bucket: Bucket;
  uniFyCode: UnifyCode;

  constructor(
    @inject.context() public context: Context,
    @inject(UnifyCodeBindings.VALIDATOR)
    public validator: CodeValidator,
    @inject('services.redlock.service')
    private lockGenerator: LockGenerator,
  ) {
    const config: UnifyCodeConfig | undefined =
      this.context.getConfigSync('unifycode');
    if (!config?.name || !config.key || !config.length) {
      throw new Error('unify code config invalid.');
    }
    this.store = Store.create('redis', {
      db: config?.store?.db,
      host: config?.store?.host,
    });

    this.uniFyCode = new UnifyCode(
      config.name,
      config.key,
      config.length,
      this,
      this,
      config.step,
    );
    // eslint-disable-next-line no-void
    void this.init();
  }

  async init() {
    this.bucket = await this.store.createBucket('unifycode');
    await this.uniFyCode.init();
  }

  async generate(): Promise<string> {
    const lock = await this.lockGenerator.lock(
      'mybox:commission:code',
      3 * 1000,
    );
    try {
      const result = await this.uniFyCode.generate();
      return result;
    } finally {
      await lock.unlock();
    }
  }

  async getRotateSpace(name: string): Promise<RotateSpace | null> {
    const result = await this.bucket.get(name);
    try {
      return JSON.parse(result);
    } catch (e) {
      //todo handle errors
    }
    return null;
  }

  async saveRotateSpace(name: string, rotateSpace: RotateSpace): Promise<void> {
    return this.bucket.set(name, JSON.stringify(rotateSpace));
  }

  async isValid(code: string): Promise<boolean> {
    return this.validator.isValid(code);
  }
}
