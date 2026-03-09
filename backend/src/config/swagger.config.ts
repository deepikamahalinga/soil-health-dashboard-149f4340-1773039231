// src/config/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Soil Report API',
    version: '1.0.0',
    description: 'API documentation for Soil Report Service',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://api.production.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      SoilReport: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          location: {
            type: 'object',
            properties: {
              latitude: { type: 'number' },
              longitude: { type: 'number' }
            }
          },
          pH: { type: 'number' },
          nutrients: {
            type: 'object',
            properties: {
              nitrogen: { type: 'number' },
              phosphorus: { type: 'number' },
              potassium: { type: 'number' }
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJSDoc(options);