import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ChatModule } from './chat.module';
import { IN_MEMORY_DB_ADAPTER } from '../providers/db-providers/in-memory-db/in-memory-db.adapter.interface';
import { MODEL_PROVIDER_TOKEN } from '../providers/model-provider.interface';

describe('ChatController (integration)', () => {
  let app: INestApplication;

  const mockHistoryAdapter = {
    get: jest.fn().mockReturnValue([]),
    getAll: jest.fn().mockReturnValue([]),
    append: jest.fn()
  };
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
    mockHistoryAdapter.getAll.mockReturnValue([]);
    mockModelProvider.chat.mockResolvedValue({ type: 'message', content: 'stub reply' });
  });

  it('POST /chat returns 201 with response shape for valid body', async () => {
    const response = await request(app.getHttpServer()).post('/chat').send({ chatId: 'test-id', message: 'hello' });

    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toMatchObject({ type: 'message', content: 'stub reply' });
  });

  it('POST /chat returns 400 when chatId is missing', async () => {
    const response = await request(app.getHttpServer()).post('/chat').send({ message: 'hello' });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('POST /chat returns 400 when message is missing', async () => {
    const response = await request(app.getHttpServer()).post('/chat').send({ chatId: 'test-id' });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
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

    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.type).toBe('diagram');
    expect(typeof response.body.diagram).toBe('string');
  });

  it('GET /chat returns 200 with empty chats when no sessions exist', async () => {
    const response = await request(app.getHttpServer()).get('/chat');

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject({ chats: [] });
  });

  it('GET /chat returns all sessions from history adapter', async () => {
    const sessions = [
      { chatId: 'session-1', messages: [{ role: 'user', content: 'hello' }] },
      { chatId: 'session-2', messages: [] }
    ];

    mockHistoryAdapter.getAll.mockReturnValue(sessions);

    const response = await request(app.getHttpServer()).get('/chat');

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject({ chats: sessions });
  });

  it('GET /chat/:chatId returns 200 with empty messages for unknown chatId', async () => {
    const response = await request(app.getHttpServer()).get('/chat/unknown-id');

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject({ chatId: 'unknown-id', messages: [] });
  });

  it('GET /chat/:chatId returns messages from history adapter', async () => {
    const messages = [
      { role: 'user', content: 'hello' },
      { role: 'ai', content: 'hi there' }
    ];

    mockHistoryAdapter.get.mockReturnValue(messages);

    const response = await request(app.getHttpServer()).get('/chat/my-session');

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject({ chatId: 'my-session', messages });
  });
});
