export class CustomException extends Error {
  statusCode: number;
  message: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

export class BadRequestError extends CustomException {
  constructor(message: string = "Bad Request") {
    super(400, message);
  }
}

export class ConflictError extends CustomException {
  constructor(message: string = "Resource is already in use") {
    super(409, message);
  }
}

export class InternalServerError extends CustomException {
  constructor() {
    super(500, "Internal Server Error");
  }
}

export class NotFoundError extends CustomException {
  constructor(message: string = "Resource Not Found") {
    super(404, message);
  }
}

export class UnauthorizedError extends CustomException {
  constructor(message: string = "Unauthorized") {
    super(401, message);
  }
}

export class ForbiddenError extends CustomException {
  constructor() {
    super(403, "Forbidden");
  }
}

export class ValidationError extends CustomException {
  constructor(message: string = "Unprocessable Entity") {
    super(422, message);
  }
}
