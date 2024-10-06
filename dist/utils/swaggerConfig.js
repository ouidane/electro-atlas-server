"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUiOptions = exports.swaggerConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// Load the Swagger YAML file
const swaggerYamlPath = path_1.default.join(__dirname, "../../swagger.yaml");
const swaggerDocument = yamljs_1.default.load(swaggerYamlPath);
// Swagger configuration
exports.swaggerConfig = Object.assign(Object.assign({}, swaggerDocument), { servers: [
        {
            url: `${process.env.SERVER_URL}/api/v1`,
            description: "API server",
        },
    ] });
// Swagger UI options
exports.swaggerUiOptions = {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    swaggerOptions: {
        persistAuthorization: true,
    },
};
//# sourceMappingURL=swaggerConfig.js.map