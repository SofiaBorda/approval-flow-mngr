CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'solicitante',
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "requesterUserId" UUID REFERENCES "user"(id) ON DELETE SET NULL,
    "approverUserId" UUID REFERENCES "user"(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE history (
    id SERIAL PRIMARY KEY,
    "updateAt" TIMESTAMP DEFAULT NOW(),
    action VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES "user"(id) ON DELETE SET NULL,
    comment TEXT,
    request_id UUID REFERENCES request(id) ON DELETE CASCADE
);

INSERT INTO "user" (username, password, role)
VALUES 
  ('carlos_solicitante', '1234', 'solicitante'),
  ('andrea_solicitante', '1234', 'solicitante'),
  ('mariana_aprobador', '1234', 'aprobador'),
  ('jose_aprobador', '1234', 'aprobador');

INSERT INTO request (title, description, "requesterUserId", "approverUserId", type, status)
VALUES
  ('Solicitud de despliegue', 'Despliegue de nueva versión en ambiente de pruebas',
    (SELECT id FROM "user" WHERE username = 'carlos_solicitante'),
    (SELECT id FROM "user" WHERE username = 'mariana_aprobador'),
    'Despliegue', 'Pendiente'),

  ('Solicitud de acceso', 'Acceso al sistema de reportes financieros',
    (SELECT id FROM "user" WHERE username = 'andrea_solicitante'),
    (SELECT id FROM "user" WHERE username = 'jose_aprobador'),
    'Acceso', 'Pendiente'),

  ('Cambio técnico', 'Actualizar librerías de Node.js a la última versión LTS',
    (SELECT id FROM "user" WHERE username = 'carlos_solicitante'),
    (SELECT id FROM "user" WHERE username = 'jose_aprobador'),
    'Cambio Técnico', 'Aprobado'),

  ('Mantenimiento servidor', 'Mantenimiento preventivo en el servidor de base de datos',
    (SELECT id FROM "user" WHERE username = 'andrea_solicitante'),
    (SELECT id FROM "user" WHERE username = 'mariana_aprobador'),
    'Mantenimiento', 'Rechazado');

INSERT INTO history (action, user_id, comment, request_id)
VALUES
  ('CREADA',
    (SELECT id FROM "user" WHERE username = 'carlos_solicitante'),
    'Solicitud de despliegue creada',
    (SELECT id FROM request WHERE title = 'Solicitud de despliegue')),

  ('ASIGNADA',
    (SELECT id FROM "user" WHERE username = 'mariana_aprobador'),
    'Asignada a Mariana para revisión',
    (SELECT id FROM request WHERE title = 'Solicitud de despliegue')),

  ('CREADA',
    (SELECT id FROM "user" WHERE username = 'andrea_solicitante'),
    'Solicitud de acceso creada',
    (SELECT id FROM request WHERE title = 'Solicitud de acceso')),

  ('APROBADA',
    (SELECT id FROM "user" WHERE username = 'jose_aprobador'),
    'Cambio técnico aprobado',
    (SELECT id FROM request WHERE title = 'Cambio técnico')),

  ('RECHAZADA',
    (SELECT id FROM "user" WHERE username = 'mariana_aprobador'),
    'Mantenimiento fuera de ventana programada',
    (SELECT id FROM request WHERE title = 'Mantenimiento servidor'));
