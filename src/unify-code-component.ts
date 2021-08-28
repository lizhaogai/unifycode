import {bind, Component, ContextTags} from '@loopback/core';
import {UnifyCodeBindings} from './keys';
import {UnifyCodeService} from './unify-code-service';

@bind({
  tags: {
    [ContextTags.KEY]: UnifyCodeBindings.COMPONENT,
  },
})
export class UnifyCodeComponent implements Component {
  services: any[];

  constructor() {
    this.services = [UnifyCodeService];
  }
}
