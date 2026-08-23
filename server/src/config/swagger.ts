export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Revora – AI Revenue Recovery Platform API',
    version: '1.0.0',
    description:
      'Autonomous, regulatory-compliant revenue recovery backend engine for Razorpay & NPCI UPI AutoPay.',
    contact: {
      name: 'Revora Engineering Team',
      email: 'sharvi@saasplatform.in',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Resource not found' },
          errorCode: { type: 'string', example: 'NOT_FOUND' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              merchant: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  businessName: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Server Health Check',
        tags: ['System'],
        responses: {
          200: {
            description: 'System operational status',
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register Merchant Account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                  businessName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Merchant successfully created' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Merchant Login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
        },
      },
    },
    '/api/recoveries': {
      get: {
        summary: 'List Recovery Sessions',
        tags: ['Recoveries'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: { description: 'Paginated recovery sessions' },
        },
      },
    },
    '/api/recoveries/{id}': {
      get: {
        summary: 'Get Recovery Session Details by ID',
        tags: ['Recoveries'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Full recovery detail with AI decision and retry timeline' },
        },
      },
    },
    '/api/recoveries/{id}/stop': {
      post: {
        summary: 'Manually Stop / Cancel a Recovery Session',
        tags: ['Recoveries'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Recovery stopped' },
        },
      },
    },
    '/api/webhooks/razorpay': {
      post: {
        summary: 'Razorpay Inbound Webhook Listener',
        tags: ['Webhooks'],
        parameters: [
          {
            name: 'x-razorpay-signature',
            in: 'header',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Webhook acknowledged and processed' },
        },
      },
    },
    '/api/analytics/summary': {
      get: {
        summary: 'Get Merchant KPI Summary',
        tags: ['Analytics'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'KPI metrics summary' },
        },
      },
    },
    '/api/simulator/trigger-event': {
      post: {
        summary: 'Trigger Hackathon Live Demo Simulator Scenarios',
        tags: ['Simulator'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['scenario'],
                properties: {
                  scenario: {
                    type: 'string',
                    enum: [
                      'AUTOPAY_INSUFFICIENT_FUNDS_U30',
                      'AUTOPAY_NPCI_LIMIT_BREACH',
                      'AUTOPAY_TERMINAL_VPA_REVOKED_ZG',
                      'CHECKOUT_ABANDONED_TIER1',
                      'CHECKOUT_ABANDONED_DYNAMIC_DISCOUNT',
                      'SIMULATE_CUSTOMER_PAYMENT',
                    ],
                  },
                  customerName: { type: 'string' },
                  amount: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Simulator scenario executed' },
        },
      },
    },
  },
};
