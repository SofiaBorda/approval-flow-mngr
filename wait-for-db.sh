#!/bin/sh
# wait-for-db.sh

set -e

echo "Esperando a PostgreSQL en $DB_HOST:$DB_PORT..."

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo "PostgreSQL no disponible aún, intentando de nuevo..."
  sleep 2
done

echo "PostgreSQL listo, iniciando backend..."
exec "$@"
