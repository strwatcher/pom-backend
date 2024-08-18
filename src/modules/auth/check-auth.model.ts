export class RequestOriginIsNotVerifiedError extends Error {
    constructor() {
        super('Request origin is not verified');
    }
}

export class SessionIsNotExistError extends Error {
    constructor() {
        super('Session is not exist');
    }
}
export class SessionIsNotValidError extends Error {
    constructor() {
        super('Session is not valid');
    }
}

export class SessionCanNotBeSignedError extends Error {
    constructor() {
        super("Session can't be signed");
    }
}
