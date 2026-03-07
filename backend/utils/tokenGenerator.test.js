const fc = require("fast-check");
const crypto = require("crypto");

/**
 * Property-Based Tests for Token Generation
 * **Validates: Requirements 13.5, 13.6**
 * 
 * Property 2: Token Uniqueness
 * Tests that generated tokens are unique across multiple generations
 * and that tokens are exactly 50 characters and alphanumeric
 */

// Mock database for testing
const mockDb = {
  tokens: new Set(),
  query: jest.fn((sql, params) => {
    const token = params[0];
    const count = mockDb.tokens.has(token) ? 1 : 0;
    return Promise.resolve([[{ count }]]);
  }),
};

// Mock the db module
jest.mock("../config/db", () => mockDb);

const { generateUniqueToken } = require("./tokenGenerator");

describe("Token Generation Property Tests", () => {
  beforeEach(() => {
    // Clear mock database before each test
    mockDb.tokens.clear();
    mockDb.query.mockClear();
  });

  test("Property 2: Token Uniqueness - generated tokens are always unique", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 10, max: 100 }), async (iterations) => {
        const tokens = new Set();

        for (let i = 0; i < iterations; i++) {
          const token = await generateUniqueToken();

          // Verify token is exactly 50 characters (Req 13.9)
          expect(token).toHaveLength(50);

          // Verify token contains only alphanumeric characters (Req 13.10)
          expect(token).toMatch(/^[A-Za-z0-9]+$/);

          // Verify token is unique (Req 13.5, 13.6)
          expect(tokens.has(token)).toBe(false);

          // Add token to set and mock database
          tokens.add(token);
          mockDb.tokens.add(token);
        }

        return true;
      }),
      { numRuns: 10 }
    );
  });

  test("Property 2: Token format validation - all tokens are 50 chars alphanumeric", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        const token = await generateUniqueToken();

        // Token must be exactly 50 characters
        expect(token.length).toBe(50);

        // Token must contain only alphanumeric characters
        const alphanumericRegex = /^[A-Za-z0-9]+$/;
        expect(alphanumericRegex.test(token)).toBe(true);

        // Token should not contain special characters
        const specialCharsRegex = /[^A-Za-z0-9]/;
        expect(specialCharsRegex.test(token)).toBe(false);

        return true;
      }),
      { numRuns: 50 }
    );
  });

  test("Property 2: Token uniqueness across orders and appointments tables", async () => {
    // Simulate tokens existing in database
    const existingTokens = ["A".repeat(50), "B".repeat(50), "C".repeat(50)];
    existingTokens.forEach((token) => mockDb.tokens.add(token));

    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        const token = await generateUniqueToken();

        // Verify new token doesn't match any existing tokens
        expect(existingTokens.includes(token)).toBe(false);

        // Verify token is unique
        expect(mockDb.tokens.has(token)).toBe(false);

        return true;
      }),
      { numRuns: 20 }
    );
  });
});
