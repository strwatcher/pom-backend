# Elysia backend with fp-ts as data-flow layer

## Development

### Copy .env.example to .env, then start dev-environment

```sh
bun dev-container
```

### Generate tables for database

```sh
bun generate
```

### Migrate database after generating tables (inside of container)

```sh
bun migrate
```
