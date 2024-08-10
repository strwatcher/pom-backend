export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            POSTGRES_CONNECTION_STRING: string;
            POSTGRES_USER: string;
            POSTGRES_PASSWORD: string;
            POSTGRES_DB: string;
        }
    }
}
