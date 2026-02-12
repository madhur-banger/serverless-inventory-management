import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import openApiSpec from '../../docs/openapi.json';

/**
 * Swagger UI HTML page
 */
const getSwaggerHtml = (specUrl: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inventory API - Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "${specUrl}",
        dom_id: '#swagger-ui'
      });
    }
  </script>
</body>
</html>`;
};

/**
 * Handler for /docs
 */
export const docsHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const stage = event.requestContext.stage;
  const host = event.headers.Host || event.headers.host;
  const specUrl = `https://${host}/${stage}/docs/spec`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: getSwaggerHtml(specUrl),
  };
};

/**
 * Handler for /docs/spec
 */
export const specHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const stage = event.requestContext.stage;
  const host = event.headers.Host || event.headers.host;
  const apiUrl = `https://${host}/${stage}`;

  const dynamicSpec = {
    ...openApiSpec,
    servers: [
      {
        url: apiUrl,
        description: `Current environment (${stage})`,
      },
    ],
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(dynamicSpec),
  };
};
