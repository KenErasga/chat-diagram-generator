import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ChatModule } from './chat.module';
import { IN_MEMORY_DB_ADAPTER } from '../providers/db-providers/in-memory-db/in-memory-db.adapter.interface';
import { MODEL_PROVIDER_TOKEN } from '../providers/model-provider.interface';

const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;

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
      .overrideProvider(IN_MEMORY_DB_ADAPTER)
      .useValue(mockHistoryAdapter)
      .overrideProvider(MODEL_PROVIDER_TOKEN)
      .useValue(mockModelProvider)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
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

    expect(response.status).toBe(HTTP_CREATED);
    expect(response.body).toMatchObject({ type: 'message', content: 'stub reply' });
  });

  it('POST /chat returns 400 when chatId is missing', async () => {
    const response = await request(app.getHttpServer()).post('/chat').send({ message: 'hello' });

    expect(response.status).toBe(HTTP_BAD_REQUEST);
  });

  it('POST /chat returns 400 when message is missing', async () => {
    const response = await request(app.getHttpServer()).post('/chat').send({ chatId: 'test-id' });

    expect(response.status).toBe(HTTP_BAD_REQUEST);
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

    expect(response.status).toBe(HTTP_CREATED);
    expect(response.body.type).toBe('diagram');
    expect(typeof response.body.diagram).toBe('string');
  });
});
