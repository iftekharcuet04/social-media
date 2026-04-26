import { TranslationService } from '../src/common/services/translation.service';
import { GlobalResponseInterceptor } from '../src/common/interceptors/global-response.interceptor';
import { of } from 'rxjs';

describe('Formatting Verification', () => {
  let translationService: TranslationService;
  let interceptor: GlobalResponseInterceptor;

  beforeEach(() => {
    translationService = new TranslationService();
    // Manually trigger init since we are not in Nest context
    (translationService as any).onModuleInit();
    interceptor = new GlobalResponseInterceptor(translationService);
  });

  it('should translate messages and format response', (done) => {
    const mockContext: any = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
        getRequest: () => ({ headers: { 'accept-language': 'en' } }),
      }),
    };

    const mockData = { message: 'SUCCESS_OPERATION', result: 'DATA' };
    const next: any = {
      handle: () => of(mockData),
    };

    interceptor.intercept(mockContext, next).subscribe((result) => {
      expect(result).toMatchObject({
        success: true,
        statusCode: 200,
        message: expect.any(String),
        data: { result: 'DATA' },
        timestamp: expect.any(String),
      });
      done();
    });
  });
});
