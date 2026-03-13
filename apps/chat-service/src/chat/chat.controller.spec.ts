import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ChatModule } from './chat.module';
import { HISTORY_ADAPTER } from '../history/history.adapter.interface';
import { MODEL_PROVIDER_TOKEN } from '../providers/model-provider.interface';

describe('ChatController (integration)', () => {
  let app: INestApplication;

  const mockHistoryAdapter = { get: jest.fn().mockReturnValue([]), append: jest.fn() };
  const mockModelProvider = {
    chat: jest.fn().mockResolvedValue({ type: 'message', content: 'stub reply' })
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ChatModule]
    })
      .overrideProvider(HISTORY_ADAPTER)
      .useValue(mockHistoryAdapter)
      .overrideProvider(MODEL_PROVIDER_TOKEN)
      .useValue(mockModelProvider)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockHistoryAdapter.get.mockReturnValue([]);
    mockModelProvider.chat.mockResolvedValue({ type: 'message', content: 'stub reply' });
  });

  it('POST /chat returns 201 with response shape for valid body', async () => {
    const response = await request(app.getHttpServer()).post('/chat').send({ chatId: 'test-id', message: 'hello' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ type: 'message', content: 'stub reply' });
  });

  it('POST /chat returns 400 when chatId is missing', async () => {
    const response = await request(app.getHttpServer()).post('/chat').send({ message: 'hello' });

    expect(response.status).toBe(400);
  });

  it('POST /chat returns 400 when message is missing', async () => {
    const response = await request(app.getHttpServer()).post('/chat').send({ chatId: 'test-id' });

    expect(response.status).toBe(400);
  });

  it('POST /chat returns diagram response when provider returns diagram type', async () => {
    mockModelProvider.chat.mockResolvedValue({
      type: 'diagram',
      content: 'Here is your diagram.',
      diagram: 'flowchart TD\n  A --> B'
    });

    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ chatId: 'test-id', message: 'create a flowchart' });

    expect(response.status).toBe(201);
    expect(response.body.type).toBe('diagram');
    expect(typeof response.body.diagram).toBe('string');
  });
});
