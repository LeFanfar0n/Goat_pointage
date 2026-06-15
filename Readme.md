# GUIDE INITIALISATION DE L'ENVIRONNEMENT
## 1. Créer l’architecture

```bash
mkdir api
mkdir front
```

## 2. Configurer le backend Fastify

```bash
cd api
npm init -y
npm install fastify @fastify/cors better-sqlite3
npm install -D typescript @types/better-sqlite3
npx tsc --init
mkdir src
mkdir database
```

## TIP: En attendant télécharge les extensions 'Thunder Client' et 'SQLite Viewer' sur VS Code



Dans `tsconfig.json`, coller ça  et ENREGISTRER:

```json
{
  // Visit https://aka.ms/tsconfig to read more about this file
  "compilerOptions": {
    // File Layout
    "rootDir": "./src",
    "outDir": "./dist",

    // Environment Settings
    // See also https://aka.ms/tsconfig/module
    "module": "nodenext",
    "target": "esnext",
    "types": [],
    // For nodejs:
    // "lib": ["esnext"],
    // "types": ["node"],
    // and npm install -D @types/node

    // Other Outputs
    "sourceMap": false,
    "declaration": false,
    "declarationMap": false,

    // Stricter Typechecking Options
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // Style Options
    // "noImplicitReturns": true,
    // "noImplicitOverride": true,
    // "noUnusedLocals": true,
    // "noUnusedParameters": true,
    // "noFallthroughCasesInSwitch": true,
    // "noPropertyAccessFromIndexSignature": true,

    // Recommended Options
    "strict": true,
    "jsx": "react-jsx",
    "verbatimModuleSyntax": false,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
  }
}
```

Créer :

```txt
New-Item src/index.ts
New-Item src/database.ts
New-Item database/db.sqlite
```

Lancer le backend :

```bash
npx tsc -w
```

dans un autre terminal :

```bash
npx nodemon .\dist\index.js
```

## 3. Configurer le frontend Vite

Depuis la **racine** du projet et dans un autre terminal :

```bash
cd ..
npm create vite@latest front -- --template vanilla-ts
cd front
npm install
npm run dev
```

Vite sera surrement hébergé içi :
'''txt
http://localhost:5173/
'''

## 4. Lancer le projet complet

Terminal 1 :

```bash
cd .\api
npx tsc -w
```

Terminal 2 :

```bash
cd .\api
npx nodemon dist/index.js
```

Terminal 3 :

```bash
cd .\front
npm run dev
```

## 5. À retenir

```txt
api    → Fastify + SQLite + routes
front  → Vite + HTML/CSS/TypeScript + fetch
```

Le front appelle le back avec :

```ts
fetch("http://localhost:8080/ma-route")
```
