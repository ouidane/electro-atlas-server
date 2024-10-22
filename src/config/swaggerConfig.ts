import yaml from "yamljs";
import path from "path";
import appConfig from "./appConfig";

// Load the Swagger YAML file
const swaggerYamlPath = path.join(__dirname, "../../swagger.yaml");
const swaggerDocument = yaml.load(swaggerYamlPath);

// Swagger configuration
export const swaggerConfig = {
  ...swaggerDocument,
  servers: [
    {
      url: `${appConfig.baseUrl}/api/v1`,
      description: "API server",
    },
  ],
};

// Swagger UI options
export const swaggerUiOptions = {
  explorer: true,
  customCss: ".swagger-ui .topbar { display: none }",
  swaggerOptions: {
    persistAuthorization: true,
  },
};
