# OAuth Client Module

Module pour gérer les applications clientes OAuth dans l'Identity Provider.

## Fonctionnalités

- **CRUD complet** : Créer, lire, mettre à jour et supprimer des clients OAuth
- **Sécurisation du clientSecret** : Utilisation de bcrypt pour hasher les secrets
- **Gestion du statut** : Activer/désactiver les clients
- **Logging** : Enregistrement des actions (création, mise à jour, suppression)
- **Génération sécurisée** : Génération de clientId et clientSecret cryptographiquement sécurisés

## Endpoints

### Créer un client OAuth

```
POST /oauth-clients
Content-Type: application/json

{
  "name": "My Application",
  "redirectUri": "http://localhost:3000/callback"
}

Response:
{
  "clientId": "client_abc123xyz",
  "clientSecret": "secret_xyz789abc",
  "status": "ACTIVE"
}
```

### Lister tous les clients

```
GET /oauth-clients

Response:
[
  {
    "id": "uuid",
    "name": "My Application",
    "clientId": "client_abc123xyz",
    "redirectUri": "http://localhost:3000/callback",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Récupérer un client spécifique

```
GET /oauth-clients/:id

Response:
{
  "id": "uuid",
  "name": "My Application",
  "clientId": "client_abc123xyz",
  "redirectUri": "http://localhost:3000/callback",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Mettre à jour un client

```
PATCH /oauth-clients/:id
Content-Type: application/json

{
  "name": "Updated Application",
  "redirectUri": "http://localhost:3001/callback"
}

Response:
{
  "id": "uuid",
  "name": "Updated Application",
  "clientId": "client_abc123xyz",
  "redirectUri": "http://localhost:3001/callback",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### Mettre à jour le statut du client

```
PATCH /oauth-clients/:id/status
Content-Type: application/json

{
  "status": "DISABLED"
}

Response:
{
  "id": "uuid",
  "name": "My Application",
  "clientId": "client_abc123xyz",
  "redirectUri": "http://localhost:3000/callback",
  "status": "DISABLED",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### Supprimer un client

```
DELETE /oauth-clients/:id

Response: 204 No Content
```

## Architecture

### Service (oauth-client.service.ts)

- Gestion de la logique métier
- Validation des clients
- Génération sécurisée des credentials
- Logging des actions
- Vérification des secrets avec bcrypt

### Contrôleur (oauth-client.controller.ts)

- Endpoints REST
- Validation des DTOs
- Transformation des réponses (masquage du clientSecret)

### Entité (oauth-client.entity.ts)

- Modèle de base de données
- Énumération des statuts

### DTOs

- `CreateOAuthClientDto` : Création de client
- `UpdateOAuthClientDto` : Mise à jour de client
- `UpdateClientStatusDto` : Mise à jour du statut
- `OAuthClientResponseDto` : Réponse API (clientSecret exclu)
- `OAuthClientSecretDto` : Réponse avec secret (création uniquement)

## Sécurité

1. **ClientSecret** : Haché avec bcrypt (10 rounds)
2. **Génération** : Utilisation de crypto.randomBytes() pour les IDs et secrets
3. **Exposition** : Le clientSecret n'est retourné qu'à la création
4. **Validation** : Utilisation de class-validator pour les DTOs

## Tests

Les tests unitaires couvrent :

- Création de clients
- Listage et recherche
- Mise à jour et suppression
- Vérification de secrets
- Gestion du statut

Lancer les tests :

```bash
npm test -- oauth-client
```
