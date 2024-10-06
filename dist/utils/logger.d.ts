declare const logger: import("winston").Logger;
declare const morganMiddleware: (req: import("http").IncomingMessage, res: import("http").ServerResponse<import("http").IncomingMessage>, callback: (err?: Error) => void) => void;
export { logger, morganMiddleware };
