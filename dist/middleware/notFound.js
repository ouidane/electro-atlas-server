"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notFound = (req, res) => res.status(404).send(`Can't find the route ${req.originalUrl}`);
exports.default = notFound;
//# sourceMappingURL=notFound.js.map