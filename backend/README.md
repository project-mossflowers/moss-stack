# backend

## setup

```bash
uv run alembic upgrade head

uv run fastapi dev src/main.py
```

## migration

```bash
uv run alembic revision --autogenerate -m "Update migration"
uv run alembic upgrade head
```
