/**
 * Mock Socket Service for Static Demo Admin
 * Provides event subscription stubs with 0 network calls or connection warnings.
 */

class MockSocket {
  constructor() {
    this.connected = true;
  }

  on(event, callback) {
    return this;
  }

  off(event, callback) {
    return this;
  }

  emit(event, data) {
    return this;
  }

  disconnect() {}
}

const mockSocketInstance = new MockSocket();

export const getAdminSocket = () => mockSocketInstance;
export default getAdminSocket;
