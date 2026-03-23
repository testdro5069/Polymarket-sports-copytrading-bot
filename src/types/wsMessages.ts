export type WsInbound =
  | { type: "ping" }
  | { type: "pong" }
  | { type: "message"; topic: string; payload: unknown };

export type WsOutbound =
  | { type: "subscribe"; channels: string[] }
  | { type: "unsubscribe"; channels: string[] };
