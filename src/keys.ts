import {BindingKey, CoreBindings} from '@loopback/core';
import {UnifyCodeComponent} from './unify-code-component';
import {CodeValidator} from './types';
import {UnifyCodeService} from './unify-code-service';

export namespace UnifyCodeBindings {
  export const COMPONENT = BindingKey.create<UnifyCodeComponent>(
    `${CoreBindings.COMPONENTS}.unifycode.component`,
  );

  export const SERVICE = BindingKey.create<UnifyCodeService>(
    `service.unifycode.service`,
  );

  export const VALIDATOR = BindingKey.create<CodeValidator>(
    `service.unifycode.validator`,
  );
}
