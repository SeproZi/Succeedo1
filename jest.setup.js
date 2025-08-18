require('@testing-library/jest-dom');

// Add a basic mock for the Request object
if (typeof global !== 'undefined' && typeof global.Request === 'undefined') {
  global.Request = class MockRequest {
    constructor(input, init) {
      this.input = input;
      this.init = init;
      this.headers = new Headers(init?.headers);
      this.method = init?.method || 'GET';
      // Add other properties as needed for your tests
    }
    // Add other Request methods/properties as needed
  };
}

// Add a basic mock for the Response object
if (typeof global !== 'undefined' && typeof global.Response === 'undefined') {
  global.Response = class MockResponse {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Headers(init?.headers);
    }
    async text() {
      return this.body.toString();
    }
    async json() {
      return JSON.parse(this.body.toString());
    }
    static json(data, init) {
      return new MockResponse(JSON.stringify(data), init);
    }
  };
}

// Add a basic mock for the Headers object
if (typeof global !== 'undefined' && typeof global.Headers === 'undefined') {
  global.Headers = class MockHeaders {
    constructor(headers) {
      this._headers = new Map(Object.entries(headers || {}));
    }
    get(name) {
      return this._headers.get(name.toLowerCase());
    }
    set(name, value) {
      this._headers.set(name.toLowerCase(), value);
    }
    // Add other Headers methods/properties as needed
  };
}

// Mocking the useRouter hook if used in your components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    reload: jest.fn(),
    isReady: true,
    asPath: '',
    pathname: '',
    query: {},
    route: '',
    basePath: '',
    isLocaleDomain: false,
    isFallback: false,
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
  usePathname: () => '',
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));
