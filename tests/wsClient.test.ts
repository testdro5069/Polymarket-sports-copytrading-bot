import { ReconnectingWs } from "../src/services/websocket/wsClient";

describe("ReconnectingWs", () => {
  it("constructs", () => {
    const w = new ReconnectingWs("ws://127.0.0.1:9", () => {});
    w.stop();
    expect(w).toBeDefined();
  });
});
