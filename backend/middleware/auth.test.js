const jwt = require("jsonwebtoken");
const fc = require("fast-check");
const auth = require("./auth");

// Mock environment variable
process.env.JWT_SECRET = "test-secret-key-for-testing-purposes-only";

describe("JWT Authentication Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  /**
   * **Validates: Requirements 11.3, 11.4**
   * 
   * Property 6: Authentication Token Validity
   * 
   * ∀ request ∈ ProtectedRequests:
   *   hasValidToken(request) ⟺ 
   *     (request.headers.authorization.startsWith('Bearer ') ∧
   *      jwt.verify(extractToken(request), SECRET_KEY) ∧
   *      extractToken(request).exp > currentTimestamp())
   * 
   * Protected requests are valid if and only if they have a properly 
   * formatted, signed, and non-expired JWT token.
   */
  describe("Property 6: Authentication Token Validity", () => {
    test("valid tokens with proper format are accepted", () => {
      fc.assert(
        fc.property(
          fc.record({
            userId: fc.integer({ min: 1, max: 10000 }),
            role: fc.constantFrom("admin", "doctor"),
          }),
          (payload) => {
            // Generate a valid token
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
              expiresIn: "24h",
            });

            // Set up request with valid Bearer token
            req.header.mockReturnValue(`Bearer ${token}`);

            // Execute middleware
            auth(req, res, next);

            // Assertions: Valid token should allow request to proceed
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
            expect(req.user).toBeDefined();
            expect(req.user.userId).toBe(payload.userId);
            expect(req.user.role).toBe(payload.role);
          }
        ),
        { numRuns: 100 }
      );
    });

    test("tokens without Bearer prefix are rejected", () => {
      fc.assert(
        fc.property(
          fc.record({
            userId: fc.integer({ min: 1, max: 10000 }),
            role: fc.constantFrom("admin", "doctor"),
          }),
          (payload) => {
            // Generate a valid token
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
              expiresIn: "24h",
            });

            // Set up request WITHOUT Bearer prefix
            req.header.mockReturnValue(token);

            // Execute middleware
            auth(req, res, next);

            // Assertions: Should reject due to invalid format
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
              message: "Invalid authorization header format",
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    test("tokens with invalid signature are rejected", () => {
      fc.assert(
        fc.property(
          fc.record({
            userId: fc.integer({ min: 1, max: 10000 }),
            role: fc.constantFrom("admin", "doctor"),
          }),
          (payload) => {
            // Generate token with DIFFERENT secret
            const token = jwt.sign(payload, "wrong-secret-key", {
              expiresIn: "24h",
            });

            // Set up request with invalid token
            req.header.mockReturnValue(`Bearer ${token}`);

            // Execute middleware
            auth(req, res, next);

            // Assertions: Should reject due to invalid signature
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
              message: "Invalid token signature",
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    test("expired tokens are rejected with specific message", async () => {
      // Use a synchronous approach with a token that's already expired
      const payload = {
        userId: 1,
        role: "admin",
      };

      // Create a token that expired 1 hour ago
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "-1h",
      });

      // Set up request with expired token
      req.header.mockReturnValue(`Bearer ${token}`);

      // Execute middleware
      auth(req, res, next);

      // Assertions: Should reject with specific expiration message
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token has expired",
      });
    });

    test("missing Authorization header is rejected", () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          // Set up request with no Authorization header
          req.header.mockReturnValue(undefined);

          // Execute middleware
          auth(req, res, next);

          // Assertions: Should reject due to missing token
          expect(next).not.toHaveBeenCalled();
          expect(res.status).toHaveBeenCalledWith(401);
          expect(res.json).toHaveBeenCalledWith({
            message: "No token, authorization denied",
          });
        }),
        { numRuns: 10 }
      );
    });

    test("malformed tokens are rejected", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 100 }).filter(
            (s) => !s.includes(".") || s.split(".").length !== 3
          ),
          (malformedToken) => {
            // Set up request with malformed token
            req.header.mockReturnValue(`Bearer ${malformedToken}`);

            // Execute middleware
            auth(req, res, next);

            // Assertions: Should reject due to malformed token
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            // Should return either invalid signature or verification failed
            expect(res.json).toHaveBeenCalled();
            const errorMessage = res.json.mock.calls[0][0].message;
            expect(
              errorMessage === "Invalid token signature" ||
                errorMessage === "Token verification failed"
            ).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Unit tests for specific edge cases
  describe("Unit Tests: Edge Cases", () => {
    test("empty Bearer token is rejected", () => {
      req.header.mockReturnValue("Bearer ");

      auth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "No token, authorization denied",
      });
    });

    test("Bearer with only spaces is rejected", () => {
      req.header.mockReturnValue("Bearer    ");

      auth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test("valid token attaches correct user info to request", () => {
      const payload = { userId: 123, role: "admin" };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      req.header.mockReturnValue(`Bearer ${token}`);

      auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe(123);
      expect(req.user.role).toBe("admin");
      expect(req.user.exp).toBeDefined();
      expect(req.user.iat).toBeDefined();
    });
  });
});
