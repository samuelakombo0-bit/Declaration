💌 Love Date : « Une petite question... »

Un mini-site interactif pour faire une déclaration et organiser le premier rendez-vous. Le créateur prépare tout dans un tableau de bord, envoie un lien par WhatsApp, puis reçoit la réponse de la même façon.

Aucun serveur, aucune base de données : tout fonctionne dans un seul fichier HTML.

✨ Fonctionnalités
Déclaration animée : fond nocturne, étoiles qui scintillent, question personnalisée avec le prénom.
Bouton NON qui rétrécit : « Tu es sûre ? », « Réfléchis encore... », « Tu me brises le cœur là 😭 », puis il disparaît. Le bouton OUI grandit.
Transition OUI : « TU AS VRAIMENT DIT OUI ????? 😳❤️ » et pluie de cœurs.
Petite carte : une enveloppe à toucher, qui révèle un message écrit par le créateur.
Assistant de rendez-vous : lieu, jour, heure, ambiance, avec une petite réaction à chaque choix.
Carte récapitulative : « NOTRE PREMIER DATE », puis confirmation.
Tableau de bord créateur : noms, options proposées, thème, musique, message, numéros WhatsApp.
5 thèmes de couleur : Nuit étoilée, Rose bonbon, Coucher de soleil, Océan, Émeraude.
3 musiques d’ambiance générées dans la page (Web Audio), sans fichier ni droits d’auteur.
Confirmation par WhatsApp : le créateur reçoit le récapitulatif et un lien vers sa carte « X a dit OUI ! 🎉 ».
🚀 Utilisation
Côté créateur
Ouvre la page (sans dans l’adresse) : le tableau de bord s’affiche.#
Renseigne ton prénom, celui de ta/ton partenaire, et si tu t’adresses à une fille ou un garçon (accord « sûre / sûr »).
Ajoute ton numéro WhatsApp (pour recevoir la réponse) et, si tu veux, le sien.
Choisis les options de rendez-vous : lieux, jours, moments, ambiances. Tu peux ajouter les tiennes.
Choisis un thème de couleur et une musique (bouton « Écouter » pour essayer).
Écris la petite carte et ta signature (facultatif).
Clique sur Générer mon lien, puis Tester pour vérifier le parcours.
Clique sur Envoyer sur WhatsApp.
Côté partenaire
Ouvre le lien reçu.
Répond à la question, ouvre la petite carte, choisit lieu, jour, heure et ambiance.
Confirme, puis appuie sur Envoyer ma réponse sur WhatsApp.
Réception de la confirmation

Le créateur reçoit un message WhatsApp avec le récapitulatif. En ouvrant le lien du message, il voit sa carte de confirmation avec le thème choisi.

🧭 Comment ça marche

Tout passe par le lien, dans la partie après le de l’adresse.#

Texte
CRÉATEUR                                          PARTENAIRE
Tableau de bord
  │
  ▼
BASE#i<config>  ───────── WhatsApp ─────────►  Ouvre le lien
                                                  │
                                                  ▼
                                      OUI → carte → assistant → confirmer
                                                  │
Carte « X a dit OUI ! »  ◄── BASE#r<réponse> ◄── WhatsApp (numéro du créateur)
Préfixe	Rôle
#i…	Invitation : configuration encodée (JSON en base64)
#r…	Réponse : choix du partenaire, affichés au créateur
(Aucun)	Tableau de bord
Format de la configuration (#i)
Clé	Contenu
c	Prénom du créateur
p	Prénom du partenaire
g	f ou (accord de « sûre / sûr »)m
m	Petit mot affiché sous le titre
w	Numéro WhatsApp du créateur (format international)
l, , , jha	Options de lieux, jours, moments, ambiances
t	Index du thème (0 à 4)
mu	Musique : 0 aucune, 1 piano, 2 nappes, 3 rythmée
k	Texte de la petite carte
s	Signature de la carte
🗂️ Structure
Version actuelle : un seul fichier
Texte
love-date.html
├── <style>    variables CSS, écrans, cartes, tableau de bord
├── <body>     s-dash, s-ask, s-wow, s-letter, s-wiz, s-card, s-done, s-reply
└── <script>   utilitaires, thèmes, musique, dashboard, invitation, démarrage
Version dossier (hébergement personnel)
Texte
love-date/
├── index.html
├── css/
│   ├── style.css
│   └── themes.css
├── js/
│   ├── main.js        démarrage et routage (#i / #r)
│   ├── dashboard.js   formulaire et génération du lien
│   ├── invite.js      bouton NON, assistant, carte
│   ├── music.js       moteur audio
│   └── utils.js       enc/dec, phone, WhatsApp, stockage
└── assets/
    └── music.mp3      facultatif
🛠️ Technologies
Fonctionnalité	Technologie
Réduction du bouton NON	DOM + CSS (transform: scale)
Messages dynamiques	JavaScript
Navigation entre écrans	Classe + fonction .activeshow()
Thèmes	Variables CSS modifiées par applyTheme()
Musique	Web Audio API (oscillateurs)
Partage des données	JSON encodé dans l’URL
Mémorisation du formulaire	localStorage
Messages WhatsApp	Liens avec texte prérempliwa.me
🇨🇬 Numéros WhatsApp (Congo-Brazzaville)

Écris le numéro normalement, par exemple . Le préfixe est ajouté automatiquement. Les formats et fonctionnent aussi. Pour un autre pays, écris le numéro en format international complet, sans ni espaces.06 123 4567242+242 06 123 456700242 06 123 4567+

🌐 Déploiement
Sur Claude (actuel)

La page est publiée comme artifact. Pour que le partenaire puisse l’ouvrir, partage-la avec « toute personne disposant du lien ».

Sur ton propre hébergement
Mets (ou le dossier éclaté) sur un hébergement statique : GitHub Pages, Netlify, Cloudflare Pages.love-date.html
Dans le script, change la constante pour ton adresse :BASE
js
   const BASE = "https://ton-site.com/love-date.html";
Si tu veux, passe de à pour des liens plus fiables sur un hébergement classique.#i…?i=…
⚠️ Limites
Pas de retour automatique : la confirmation passe par WhatsApp, le partenaire doit appuyer sur « Envoyer ».
Liens longs : la configuration est dans l’URL, surtout si la petite carte est longue.
Pas de confidentialité forte : quiconque a le lien peut lire son contenu.
Musique : elle démarre au premier toucher, car les navigateurs bloquent le son automatique.
Stockage : le formulaire est mémorisé par navigateur, il n’est pas partagé entre appareils.
🔮 Pistes d’amélioration
Base de données (Firebase, Supabase) pour voir la réponse en direct et avoir des liens courts.
Vraie musique avec et un bouton lecture.assets/music.mp3
Photos dans la petite carte.
Plus de thèmes ou de langues.
Compte à rebours jusqu’au rendez-vous.
