import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AppController]
    }).compile();

    controller = module.get(AppController);
  });

  it('returns health status ok', () => {
    expect(controller.getHealth()).toEqual({ status: 'ok' });
  });
});
