import {RepositoryMixin} from '@loopback/repository';
import {ServiceMixin} from '@loopback/service-proxy';
import {BootMixin} from '@loopback/boot';
import {Application} from '@loopback/core';
import {UnifyCodeComponent} from '../unify-code-component';
import {CodeValidator} from '../types';
import {UnifyCodeBindings} from '../keys';

class V implements CodeValidator {
  async isValid(code: string): Promise<boolean> {
    return true;
  }
}

export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(Application)),
) {
  constructor(options: any = {}) {
    super(options);

    this.configure('unifycode').to({
      name: 'test',
      key: 'abcdefghjkm',
      length: 3,
      step: options.step ?? 256,
      store: {
        host: 'localhost',
        db: 10,
      },
    });
    this.component(UnifyCodeComponent);
    this.bind(UnifyCodeBindings.VALIDATOR).to(new V());
  }
}

export async function setupApplication(): Promise<MyApplication> {
  const app = new MyApplication({});
  await app.start();

  return app;
}
