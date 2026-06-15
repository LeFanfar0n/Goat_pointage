import Sqlite3 from "better-sqlite3";

export const db = Sqlite3("database/db.sqlite");

export function initDatabase() {
  // Création de la table employe
  db.exec(`
    CREATE TABLE IF NOT EXISTS employes (
      id_employe INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);
  // Création de la table pointage
  db.exec(`
    CREATE TABLE IF NOT EXISTS pointages (
      id_pointage INTEGER PRIMARY KEY AUTOINCREMENT,
      id_employe INTEGER NOT NULL,
      arrivee TEXT NOT NULL,
      depart TEXT,
      FOREIGN KEY (id_employe) REFERENCES employes(id_employe)
    )
  `);
}