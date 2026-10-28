# Une petite question… 💌

Une application React pour créer une invitation personnalisée, l’envoyer sur WhatsApp et organiser un premier rendez-vous.

## Démarrer

Depuis ce dossier :

```sh
npm install
npm run dev
```

Pour vérifier la version de production :

```sh
npm run lint
npm run build
```

## Parcours

1. Renseigne les prénoms, les numéros WhatsApp et les options de rendez-vous.
2. Choisis un thème, une musique et écris éventuellement une petite carte.
3. Génère le lien, teste l’invitation puis partage-la sur WhatsApp.
4. La personne répond, découvre la carte et choisit le lieu, le jour, l’heure et l’ambiance.
5. Sa confirmation ouvre WhatsApp avec un récapitulatif et un lien vers la carte finale.

Les invitations (`#i…`) et les confirmations (`#r…`) transportent leurs données dans le fragment de l’URL. Aucun serveur ni base de données n’est requis. Les liens ne sont pas privés : toute personne qui les possède peut lire les informations qu’ils contiennent.

Les numéros du Congo-Brazzaville sont saisis normalement ; le préfixe `242` est ajouté automatiquement aux numéros locaux. La musique synthétisée par la page commence uniquement après une interaction, conformément aux restrictions de lecture automatique des navigateurs.
