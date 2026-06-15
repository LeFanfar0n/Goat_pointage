import './style.css'

const API_URL = "http://localhost:8080";

function attachButtons() {
  const btnGoConnexion = document.querySelector("#btn-go-auth") as HTMLButtonElement;
  const btnGoRegister = document.querySelector("#btn-go-register") as HTMLButtonElement;
  const btnConnexion = document.querySelector("#btn-login") as HTMLButtonElement;
  const btnDeconnexion = document.querySelector("#btn-deconnexion") as HTMLButtonElement;
  const btnRegister = document.querySelector("#btn-register") as HTMLButtonElement;
  const btnArrivee = document.querySelector("#btn-pointage-arrivee") as HTMLButtonElement;
  const btnDepart = document.querySelector("#btn-pointage-depart") as HTMLButtonElement;
  const btnHistorique = document.querySelector("#btn-historique") as HTMLButtonElement;
  const btnRetourPointage = document.querySelector("#btn-retour-pointage") as HTMLButtonElement;

  btnGoConnexion.addEventListener("click", afficherConnexion);
  btnGoRegister.addEventListener("click", afficherAjoutEmploye);
  btnConnexion.addEventListener("click", connecterEmploye);
  btnDeconnexion.addEventListener("click", deconnecterEmploye)
  btnRegister.addEventListener("click", ajouterEmploye);
  btnArrivee.addEventListener("click", pointerArrivee);
  btnDepart.addEventListener("click", pointerDepart);
  btnHistorique.addEventListener("click", chargerHistorique);
  btnRetourPointage.addEventListener("click", afficherPointage)
}

function afficherPage(pageId: string) {
  document.querySelectorAll("section").forEach((section) => {
    section.classList.add("hidden");
  });

  document.querySelector(`#${pageId}`)?.classList.remove("hidden");
}

function afficherConnexion() {
  afficherPage("auth-page");
}

type Employe = {
  id_employe: number;
  nom: string;
  prenom: string;
  email: string;
  password: string;
}

let employeConnecte: Employe | null = null;

async function connecterEmploye() {
  const email = document.querySelector("#auth-email") as HTMLInputElement;
  const password = document.querySelector("#auth-password") as HTMLInputElement;


  const response = await fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    })
  });

  if (!response.ok) {
    alert("Identifiants incorrects");
    return;
  }
  const employe: Employe = await response.json();
  employeConnecte = employe;
  await verifierPointageEnCours();

  console.log(employe);

  alert(`Bienvenue ${employe.prenom} ${employe.nom} !`)

  afficherPage("pointage-page");
  email.value ="";
  password.value ="";
}

function deconnecterEmploye() {
  employeConnecte = null;
  pointageEnCours = null;

  afficherPage("home-page");
}

type Pointage = {
  id_pointage: number;
  id_employe: number;
  arrivee: string;
  depart: string | null;
}

let pointageEnCours: Pointage | null = null;

async function pointerArrivee() {
  if (employeConnecte == null) {
    alert("Veuillez vous connecter avant de pointer");
    return;
  }

  const response = await fetch(`${API_URL}/pointages`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      id_employe: employeConnecte.id_employe,
    })
  });

  if (!response.ok) {
    alert("ID employé incorrect");
    return;
  }
  const pointage: Pointage = await response.json();

  pointageEnCours = pointage;

  alert(`Pointage ${pointage.id_pointage} effectué à ${pointage.arrivee}`)

  const btnArrivee = document.querySelector("#btn-pointage-arrivee") as HTMLButtonElement;
  const btnDepart = document.querySelector("#btn-pointage-depart") as HTMLButtonElement;

  btnArrivee.classList.add("hidden");
  btnDepart.classList.remove("hidden");
}
async function pointerDepart() {
  if (pointageEnCours == null) {
    alert("Aucu pointage en cours");
    return;
  }

  const response = await fetch(`${API_URL}/pointages/${pointageEnCours.id_pointage}`, {
    method: "PUT"
  });

  if (!response.ok) {
    alert("Erreur lors du pointage du départ");
    return;
  }
  const result = await response.json();

  alert(`Départ enregistré à ${result.depart}`)

  pointageEnCours = null;

  const btnArrivee = document.querySelector("#btn-pointage-arrivee") as HTMLButtonElement;
  const btnDepart = document.querySelector("#btn-pointage-depart") as HTMLButtonElement;

  btnDepart.classList.add("hidden");
  btnArrivee.classList.remove("hidden");
}

type HistoriquePointage = {
  id_pointage: number;
  arrivee: string;
  depart: string | null;
  id_employe: number;
  nom: string;
  prenom: string;
  email: string;
};

async function afficherHistoriqueEmploye(id_employe: number) {
  const response = await fetch(`${API_URL}/pointages/${id_employe}`);

  if (!response.ok) {
    alert("Impossible de charger l'historique");
    return;
  }

  const pointages: HistoriquePointage[] = await response.json();

  const tableBody = document.querySelector("#historique-table-body") as HTMLTableSectionElement;
  tableBody.innerHTML = '';

  if (pointages.length === 0) {
    tableBody.innerHTML = `
    <tr>
      <td colspan="3">Aucun pointage trouvé</td>
    </tr>
  `;
  } else {
    for (const pointage of pointages) {
      tableBody.innerHTML += `
      <tr>
        <td>${pointage.prenom} ${pointage.nom}</td>
        <td>${formatDate(pointage.arrivee)}</td>
        <td>${formatDate(pointage.depart)}</td>
      </tr>
    `;
    }
  }
  afficherPage("historique-page");
}

async function chargerHistorique() {
  await afficherHistoriqueEmploye(employeConnecte!.id_employe);
}

async function afficherPointage() {
  await verifierPointageEnCours();
  afficherPage("pointage-page");
}

function afficherAjoutEmploye() {
  afficherPage("register-page");
}

const inputEmployeNom = document.querySelector("#reg-nom") as HTMLInputElement;
const inputEmployePrenom = document.querySelector("#reg-prenom") as HTMLInputElement;
const inputEmployeEmail = document.querySelector("#reg-email") as HTMLInputElement;
const inputEmployePassword = document.querySelector("#reg-password") as HTMLInputElement;

async function ajouterEmploye() {

  const nouvelEmploye = {
    nom: inputEmployeNom.value,
    prenom: inputEmployePrenom.value,
    email: inputEmployeEmail.value,
    password: inputEmployePassword.value
  };

  const response = await fetch(`${API_URL}/employes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(nouvelEmploye)
  });

  if (!response.ok) {
    alert("Erreur lors de la création de l'employé");
    return;
  }

  inputEmployeNom.value = "";
  inputEmployePrenom.value = "";
  inputEmployeEmail.value = "";
  inputEmployePassword.value = "";

  alert("Employé ajouté !");
  afficherPage("auth-page");
}

async function verifierPointageEnCours() {
  if (employeConnecte === null) {
    return;
  }

  const response = await fetch(`${API_URL}/pointages/en-cours/${employeConnecte.id_employe}`);
  const pointage: Pointage | null = await response.json();

  const btnArrivee = document.querySelector("#btn-pointage-arrivee") as HTMLButtonElement;
  const btnDepart = document.querySelector("#btn-pointage-depart") as HTMLButtonElement;

  if (pointage === null) {
    pointageEnCours = null;
    btnArrivee.classList.remove("hidden");
    btnDepart.classList.add("hidden");
  } else {
    pointageEnCours = pointage;
    btnArrivee.classList.add("hidden");
    btnDepart.classList.remove("hidden");
  }
}

function formatDate(dateIso: string | null): string {
  if (dateIso === null) return "En cours";
  return new Date(dateIso).toLocaleString("fr-FR");
}

window.addEventListener("load", attachButtons);