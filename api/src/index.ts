import Fastify from "fastify";
import cors from "@fastify/cors";
import { db, initDatabase } from "./database"


const fastify = Fastify();

fastify.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
});

initDatabase();

type EmployeBody = {
    nom: string;
    prenom: string;
    email: string;
    password: string;
};

fastify.post("/employes", async (request, reply) => {
    const {
        nom,
        prenom,
        email,
        password
    } = request.body as EmployeBody;

    if (!nom || !email || !password) {
        reply.code(400).send({ error: "Champs manquants" });
        return;
    }

    const passwordHash = await hashPassword(password);

    const query = db.prepare(`
        INSERT INTO employes (nom, prenom, email, password) VALUES (?,?,?,?)
        `);

    try {
    const result = query.run(nom, prenom, email, passwordHash);

    reply.code(201).send({ id_employe: result.lastInsertRowid });
    } catch {
        reply.code(409);
    }

});

type AuthBody = {
    email: string;
    password: string;
}

fastify.post("/auth", async (request, reply) => {
    const {
        email,
        password
    } = request.body as AuthBody;

    const passwordHash = await hashPassword(password);

    const query = db.prepare(`
        SELECT id_employe, nom, prenom, email
        FROM employes
        WHERE email = ? AND password = ?
    `);

    const employe = query.get(email, passwordHash);

    if (!employe) {
        reply.code(404).send({ error: "Identifiants incorrectes" });
    }
    else {
        reply.code(200).send(employe);
    }
});

type PointageBody = {
    id_employe: number;
};

fastify.post("/pointages", (request, reply) => {
    const { id_employe } = request.body as PointageBody;

    if (!id_employe) {
        reply.code(400).send({ error: "Employé manquant" });
        return;
    }

    const verifEmploye = db.prepare(`
        SELECT *
        FROM employes
        WHERE id_employe = ?
        `)

    if(!verifEmploye.get(id_employe)) {
        reply.code(409).send({
            error: "Employé inéxistant"
        })
    }

    const verifPointage = db.prepare(`
        SELECT *
        FROM pointages
        WHERE id_employe = ?
        AND depart IS NULL
        `)

    if(!verifPointage.get(id_employe)) {
        reply.code(409).send({
            error: "Pointage déjà en cours"
        })
    }

    const arrivee = new Date().toISOString();

    const query = db.prepare(`
        INSERT INTO pointages (id_employe,arrivee) 
        VALUES (?,?)
        `);

    const result = query.run(id_employe, arrivee);

    reply.code(201).send({
        id_pointage: result.lastInsertRowid,
        id_employe,
        arrivee
    });

});

fastify.put("/pointages/:id", (request, reply) => {
    const { id } = request.params as { id: string };

    const depart = new Date().toISOString();
    const query = db.prepare(`
        UPDATE pointages SET depart = ? WHERE id_pointage = ?
    `);

    const result = query.run(depart, id);

    reply.code(200).send({ updated: result.changes, depart });
});

fastify.get("/pointages/:id_employe", (request, reply) => {
    const { id_employe } = request.params as { id_employe: string };
    const query = db.prepare(`
    SELECT 
      pointages.id_pointage,
      pointages.arrivee,
      pointages.depart,
      employes.id_employe,
      employes.nom,
      employes.prenom,
      employes.email
    FROM pointages
    INNER JOIN employes
      ON pointages.id_employe = employes.id_employe
    WHERE pointages.id_employe = ?
  `);
    const pointages = query.all(id_employe);

    reply.code(200).send(pointages);
});

fastify.get("/pointages/en-cours/:id_employe", (request, reply) => {
    const { id_employe } = request.params as { id_employe: string };

    const query = db.prepare(`
    SELECT *
    FROM pointages
    WHERE id_employe = ?
    AND depart IS NULL
    ORDER BY arrivee DESC
    LIMIT 1
  `);

    const pointage = query.get(id_employe);

    reply.code(200).send(pointage ?? null);
});

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hash = await crypto.subtle.digest({ name: "SHA-256" }, data);

    return Array.from(new Uint8Array(hash))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

fastify.listen({ port: 8080 }, () => {
    console.log("API lancée sur http://localhost:8080");
})