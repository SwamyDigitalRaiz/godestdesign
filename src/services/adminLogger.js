/**
 * Centralized, structured console logger for Go Dest Admin API requests & responses.
 * Provides clear console grouping with header, params, body, and token inspection.
 */
export const adminLogger = {
  request(config) {
    try {
      const method = (config.method || 'GET').toUpperCase();
      const url = `${config.baseURL || ''}${config.url || ''}`;
      const token = config.headers?.Authorization || config.headers?.authorization;

      console.groupCollapsed(
        `%c🚀 [ADMIN-API-REQ] ${method} ${config.url || ''}`,
        'color: #2563eb; font-weight: bold;'
      );
      console.log('🔗 Full URL:', url);
      if (token) {
        console.log('🔑 Auth Token:', token);
      }
      if (config.headers) {
        console.log('📋 Headers:', config.headers);
      }
      if (config.params && Object.keys(config.params).length > 0) {
        console.log('🔍 Params:', config.params);
      }
      if (config.data !== undefined) {
        console.log('📦 Body:', config.data);
      }
      console.groupEnd();
    } catch (e) {
      console.warn('Logging error:', e);
    }
  },

  response(response) {
    try {
      const method = (response.config?.method || 'GET').toUpperCase();
      const url = response.config?.url || '';
      const status = response.status;
      const duration = response.config?.metadata?.startTime
        ? Date.now() - response.config.metadata.startTime
        : null;
      const timeStr = duration !== null ? `(${duration}ms)` : '';

      console.groupCollapsed(
        `%c✅ [ADMIN-API-RES] ${method} ${url} [${status}] ${timeStr}`,
        'color: #16a34a; font-weight: bold;'
      );
      console.log('📥 Response Data:', response.data);
      console.groupEnd();
    } catch (e) {
      console.warn('Logging error:', e);
    }
  },

  error(error) {
    try {
      const config = error.config || {};
      const method = (config.method || 'GET').toUpperCase();
      const url = config.url || '';
      const status = error.response?.status || 'ERR';
      const duration = config.metadata?.startTime
        ? Date.now() - config.metadata.startTime
        : null;
      const timeStr = duration !== null ? `(${duration}ms)` : '';

      console.group(
        `%c❌ [ADMIN-API-ERR] ${method} ${url} [${status}] ${timeStr}`,
        'color: #dc2626; font-weight: bold;'
      );
      console.log('⚠️ Error Message:', error.message);
      if (error.response?.data) {
        console.log('📥 Response Data:', error.response.data);
      }
      if (config.headers) {
        console.log('📋 Headers sent:', config.headers);
      }
      if (config.data) {
        console.log('📦 Body sent:', config.data);
      }
      console.groupEnd();
    } catch (e) {
      console.warn('Logging error:', e);
    }
  },
};

export default adminLogger;

