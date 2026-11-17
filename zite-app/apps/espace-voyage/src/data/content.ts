import type { ChecklistItem, InfoPage, Tile } from "../types";

/** Tuiles du tableau de bord (hors "Carte"). */
export const TILES: Tile[] = [
  {
    key: "formalites",
    ico: "📋",
    label: "Formalités"
  },
  {
    key: "argent",
    ico: "💰",
    label: "Argent"
  },
  {
    key: "internet",
    ico: "📶",
    label: "Internet"
  },
  {
    key: "applis",
    ico: "📱",
    label: "Applis"
  },
  {
    key: "transports",
    ico: "🛵",
    label: "Transports"
  },
  {
    key: "valise",
    ico: "🧳",
    label: "Valise"
  },
  {
    key: "sante",
    ico: "🏥",
    label: "Santé"
  },
  {
    key: "urgence",
    ico: "🚨",
    label: "Urgence"
  }
];

/** Tuile "Carte" : lien externe vers Google My Maps. */
export const MAP_TILE: Tile = {
  key: "carte",
  ico: "🗺️",
  label: "Carte"
};

export const DASHBOARD_TILES: Tile[] = [...TILES, MAP_TILE];

/** Sections de la checklist, dans l'ordre d'affichage. */
export const CHECKLIST_SECTIONS = [
  "3 à 6 mois avant",
  "1 mois avant",
  "10 jours avant",
  "Derniers jours"
];

/** Items de la checklist. L'index dans ce tableau = id sauvegardé côté serveur. */
export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    section: "3 à 6 mois avant",
    text: "Vérifier date péremption passeport (> 6 mois)"
  },
  {
    section: "3 à 6 mois avant",
    text: "Demander permis international (délais longs)",
    link: "https://permisdeconduire.ants.gouv.fr/"
  },
  {
    section: "3 à 6 mois avant",
    text: "Rdv médical pour point vaccin"
  },
  {
    section: "1 mois avant",
    text: "Appeler banque pour faire le point"
  },
  {
    section: "1 mois avant",
    text: "Vérifier les frais internationaux CB"
  },
  {
    section: "1 mois avant",
    text: "Vérifier les plafonds CB"
  },
  {
    section: "1 mois avant",
    text: "Commander une carte sans frais si besoin"
  },
  {
    section: "1 mois avant",
    text: "Vérifier les garanties de ton assurance CB"
  },
  {
    section: "1 mois avant",
    text: "Comparer les assurances voyage"
  },
  {
    section: "1 mois avant",
    text: "Réserver les premiers logements"
  },
  {
    section: "1 mois avant",
    text: "Vérifier ton forfait internet"
  },
  {
    section: "1 mois avant",
    text: "Préparer trousse médicale"
  },
  {
    section: "10 jours avant",
    text: "Avoir un billet de sortie ou de continuation"
  },
  {
    section: "10 jours avant",
    text: "Faire ton visa en ligne",
    link: "https://evisa.imigrasi.go.id/"
  },
  {
    section: "10 jours avant",
    text: "Payer la taxe touristique",
    link: "https://lovebali.baliprov.go.id/"
  },
  {
    section: "10 jours avant",
    text: "Remplir le Fil d'Ariane",
    link: "https://fildariane.diplomatie.gouv.fr/fildariane-internet/se-connecter"
  },
  {
    section: "10 jours avant",
    text: "Scanner tes documents de voyage"
  },
  {
    section: "10 jours avant",
    text: "Télécharger les applis nécessaires"
  },
  {
    section: "Derniers jours",
    text: "Compléter All Indonesia (3j avant)",
    link: "https://allindonesia.imigrasi.go.id/"
  },
  {
    section: "Derniers jours",
    text: "Faire ton check-in avion (24H avant)"
  },
  {
    section: "Derniers jours",
    text: "Installer ton eSIM (si nécessaire)"
  },
  {
    section: "Derniers jours",
    text: "Préparer sac / valise"
  }
];

/** Contenu des pages d'information. "**texte**" = gras. */
export const INFO_PAGES: InfoPage[] = [
  {
    key: "formalites",
    title: "📋 Formalités",
    intro: "Détails des démarches à faire avant de partir.",
    blocks: [
      {
        ico: "🛂",
        title: "Passeport",
        content: [
          {
            type: "p",
            text: "Validité **obligatoire de plus de 6 mois** à la date d'arrivée. Il doit être en parfait état."
          },
          {
            type: "p",
            text: "Garde une copie numérique sur ton téléphone."
          }
        ]
      },
      {
        ico: "🏍️",
        title: "Permis international",
        content: [
          {
            type: "p",
            text: "**Obligatoire** pour louer un scoot et être couvert par l'assurance (en plus du permis moto)."
          },
          {
            type: "p",
            text: "À demander sur le site de l'ANTS — la procédure peut prendre du temps **(3 à 6 mois)**."
          },
          {
            type: "p",
            text: "Prends toujours ton permis français avec toi également."
          },
          {
            type: "link",
            url: "https://permisdeconduire.ants.gouv.fr/",
            label: "Faire la demande sur ANTS"
          }
        ]
      },
      {
        ico: "🧭",
        title: "Fil d'Ariane",
        content: [
          {
            type: "p",
            text: "Pas obligatoire mais recommandé. Inscris-toi pour être alerté(e) en cas de crise politique, sanitaire ou météo."
          },
          {
            type: "link",
            url: "https://fildariane.diplomatie.gouv.fr/fildariane-internet/se-connecter",
            label: "S'inscrire au Fil d'Ariane"
          }
        ]
      },
      {
        ico: "✈️",
        title: "Visa",
        content: [
          {
            type: "p",
            text: "Valable **30 jours**, renouvelable une fois sur place. **Billet de sortie obligatoire.**"
          },
          {
            type: "p",
            text: "À faire en ligne **10 jours avant le départ** (recommandé) ou directement à l'aéroport à l'arrivée."
          },
          {
            type: "tags",
            items: [
              "500 000 IDR — 25€ / personne"
            ]
          },
          {
            type: "link",
            url: "https://evisa.imigrasi.go.id/",
            label: "Site officiel E-Visa Indonésie"
          },
          {
            type: "link",
            url: "https://www.instagram.com/p/DNN1WMhyRLG/",
            label: "Voir le tuto Instagram"
          }
        ]
      },
      {
        ico: "🏝️",
        title: "Taxe touristique Bali",
        content: [
          {
            type: "p",
            text: "À payer en ligne avant de partir (recommandé) ou à l'aéroport à l'arrivée."
          },
          {
            type: "tags",
            items: [
              "~9€ / personne"
            ]
          },
          {
            type: "link",
            url: "https://lovebali.baliprov.go.id/",
            label: "Payer la taxe en ligne"
          },
          {
            type: "link",
            url: "https://www.instagram.com/p/DNinka4Snax/",
            label: "Voir le tuto Instagram"
          }
        ]
      },
      {
        ico: "🛃",
        title: "All Indonesia",
        content: [
          {
            type: "p",
            text: "Déclaration obligatoire, à faire dans les **3 jours avant l'arrivée**. C'est gratuit."
          },
          {
            type: "p",
            text: "En couple ou en famille :\n2 déclarations = 1 seul QR code."
          },
          {
            type: "link",
            url: "https://allindonesia.imigrasi.go.id/",
            label: "Remplir All Indonesia"
          },
          {
            type: "link",
            url: "https://www.instagram.com/reel/DScjUFKjCUS/",
            label: "Voir le tuto Instagram"
          }
        ]
      }
    ]
  },
  {
    key: "argent",
    title: "💰 Argent",
    intro: "Évite les mauvaises surprises ou les arnaques.",
    blocks: [
      {
        ico: "💳",
        title: "Carte bancaire",
        content: [
          {
            type: "p",
            text: "**Appelle ta banque** pour vérifier tes frais à l'étranger avant de partir."
          },
          {
            type: "p",
            text: "Les meilleures options sans frais : **Revolut**, **Fortuneo**, **Boursorama** ou **N26**."
          },
          {
            type: "p",
            text: "Emporte toujours **2 cartes** en cas de vol ou de carte avalée."
          }
        ]
      },
      {
        ico: "🏧",
        title: "Retraits ATM",
        content: [
          {
            type: "p",
            text: "Utilise de préférence les distributeurs **BCA**, **BNI**, **BRI**, **Mandiri** ou **Maybank** pour limiter les frais locaux."
          },
          {
            type: "p",
            text: "Limite de retrait : entre **150€ et 250€** par transaction selon les banques."
          }
        ]
      },
      {
        ico: "💵",
        title: "Cash & change",
        content: [
          {
            type: "p",
            text: "Beaucoup de paiements se font sans contact (+3% de frais imposés souvent) ou en cash. Garde toujours un peu de liquide sur toi."
          },
          {
            type: "p",
            text: "**Attention aux arnaques** dans les bureaux de change — recompte toujours la somme avant de partir."
          }
        ]
      }
    ]
  },
  {
    key: "internet",
    title: "📶 Internet",
    intro: "Rien de compliqué pour avoir internet sur place — Voici 3 options selon ton profil.",
    blocks: [
      {
        ico: "📡",
        title: "Forfait international",
        content: [
          {
            type: "p",
            text: "Vérifie ce que ton opérateur propose avant de partir."
          },
          {
            type: "p",
            text: "**Free** et **Bouygues** incluent souvent l'Indonésie. **Orange** propose des options entre 29,99€ et 39,99€."
          }
        ]
      },
      {
        ico: "📲",
        title: "eSIM",
        content: [
          {
            type: "p",
            text: "Solution pratique : tout se configure depuis ton téléphone, sans changer de carte SIM."
          },
          {
            type: "p",
            text: "Regarde **Airalo**, **Holafly** ou **Saily**. Vérifie d'abord que ton téléphone est compatible eSIM dans les paramètres."
          },
          {
            type: "link",
            url: "https://www.airalo.com/",
            label: "Voir Airalo (eSIM)"
          }
        ]
      },
      {
        ico: "📶",
        title: "SIM locale",
        content: [
          {
            type: "p",
            text: "**Meilleure option** pour une connexion stable à petit prix."
          },
          {
            type: "p",
            text: "**Telkomsel** est le réseau le plus fiable. À acheter directement à l'aéroport à l'arrivée — tu choisis la durée et le volume de data."
          }
        ]
      },
      {
        ico: "💡",
        title: "À savoir",
        content: [
          {
            type: "p",
            text: "La wifi est disponible dans la **quasi-totalité des hébergements, restaurants et cafés** de Bali."
          }
        ]
      }
    ]
  },
  {
    key: "applis",
    title: "📱 Applis",
    intro: "Pense à télécharger ces applis avant ton arrivée.",
    blocks: [
      {
        ico: "🚗",
        logoUrl: "https://www.google.com/s2/favicons?domain=grab.com&sz=64",
        title: "Grab — Taxi voiture",
        content: [
          {
            type: "p",
            text: "L'équivalent d'Uber à Bali — **le plus fiable pour les trajets en voiture**."
          },
          {
            type: "link",
            url: "https://apps.apple.com/sg/app/grab-taxi-ride-hailing-app/id647268330",
            label: "🍎 App Store (iPhone)"
          },
          {
            type: "link",
            url: "https://play.google.com/store/apps/details?id=com.grab.passenger",
            label: "🤖 Play Store (Android)"
          }
        ]
      },
      {
        ico: "🛵",
        logoUrl: "https://www.google.com/s2/favicons?domain=gojek.com&sz=64",
        title: "Gojek — Taxi scoot",
        content: [
          {
            type: "p",
            text: "Parfait pour les **petits trajets rapides en scooter**, plus souple sur les courtes distances."
          },
          {
            type: "link",
            url: "https://apps.apple.com/id/app/gojek/id944875099",
            label: "🍎 App Store (iPhone)"
          },
          {
            type: "link",
            url: "https://play.google.com/store/apps/details?id=com.gojek.app",
            label: "🤖 Play Store (Android)"
          }
        ]
      },
      {
        ico: "💬",
        logoUrl: "https://www.google.com/s2/favicons?domain=whatsapp.com&sz=64",
        title: "WhatsApp — Messages",
        content: [
          {
            type: "p",
            text: "Reste en contact avec tes proches depuis l'autre bout du monde, **gratuitement en wifi**."
          },
          {
            type: "link",
            url: "https://apps.apple.com/app/whatsapp-messenger/id310633997",
            label: "🍎 App Store (iPhone)"
          },
          {
            type: "link",
            url: "https://play.google.com/store/apps/details?id=com.whatsapp",
            label: "🤖 Play Store (Android)"
          }
        ]
      },
      {
        ico: "⛵",
        logoUrl: "https://www.google.com/s2/favicons?domain=12go.com&sz=64",
        title: "12GO Asia — Bateaux",
        content: [
          {
            type: "p",
            text: "Réserve tes **trajets en bateau** entre les îles (Nusa Penida, Gili, Lombok) facilement."
          },
          {
            type: "link",
            url: "https://12go.com/en/",
            label: "Ouvrir 12GO Asia"
          },
          {
            type: "link",
            url: "https://apps.apple.com/th/app/12go-asia/id1547783024",
            label: "🍎 App Store (iPhone)"
          },
          {
            type: "link",
            url: "https://play.google.com/store/apps/details?id=com.rr12go.app",
            label: "🤖 Play Store (Android)"
          }
        ]
      },
      {
        ico: "🎯",
        logoUrl: "https://www.google.com/s2/favicons?domain=getyourguide.com&sz=64",
        title: "GetYourGuide — Activités",
        content: [
          {
            type: "p",
            text: "Réserve tes **activités, visites guidées et excursions** à Bali en quelques clics."
          },
          {
            type: "link",
            url: "https://www.getyourguide.com/",
            label: "Ouvrir GetYourGuide"
          },
          {
            type: "link",
            url: "https://apps.apple.com/app/getyourguide-tours-activities/id658085546",
            label: "🍎 App Store (iPhone)"
          },
          {
            type: "link",
            url: "https://play.google.com/store/apps/details?id=com.getyourguide.android",
            label: "🤖 Play Store (Android)"
          }
        ]
      },
      {
        ico: "💱",
        logoUrl: "https://www.google.com/s2/favicons?domain=xe.com&sz=64",
        title: "XE Currency — Convertisseur",
        content: [
          {
            type: "p",
            text: "Convertis les prix en **IDR (roupie indonésienne)** en temps réel pour éviter les surprises au change."
          },
          {
            type: "link",
            url: "https://apps.apple.com/app/xe-currency-converter-money/id455527054",
            label: "🍎 App Store (iPhone)"
          },
          {
            type: "link",
            url: "https://play.google.com/store/apps/details?id=com.xe.currency",
            label: "🤖 Play Store (Android)"
          }
        ]
      }
    ]
  },
  {
    key: "transports",
    title: "🛵 Transports",
    intro: "Ne sous-estime pas les temps de trajet (trafic et bouchons ++).",
    blocks: [
      {
        ico: "📱",
        title: "Grab & Gojek",
        content: [
          {
            type: "p",
            text: "Les applis de transport les plus pratiques. Grab pour commander un **taxi voiture**, Gojek pour un **taxi scooter**. Prix fixé à l'avance, pas de négociation."
          },
          {
            type: "p",
            text: "Peu disponibles dans le nord de Bali et les zones reculées."
          }
        ]
      },
      {
        ico: "🚗",
        title: "Chauffeur privé à la journée",
        content: [
          {
            type: "p",
            text: "La meilleure option si tu veux visiter plusieurs endroits dans une journée, voyager en couple ou en famille, ou ne pas conduire de scoot."
          },
          {
            type: "tags",
            items: [
              "Anglophone — 50 à 70€/jour",
              "Francophone — 80 à 100€/jour"
            ]
          }
        ]
      },
      {
        ico: "🛵",
        title: "Louer un scoot",
        content: [
          {
            type: "p",
            text: "Idéal pour être **autonome et flexible**. Avant de partir : prends des photos, vérifie les freins et les pneus, le **casque est obligatoire**."
          },
          {
            type: "p",
            text: "Pour être assuré(e) en cas d'accident : **permis moto + permis international obligatoires**."
          },
          {
            type: "p",
            text: "Le plus simple est de louer directement auprès de ton logement ou de mes contacts."
          },
          {
            type: "tags",
            items: [
              "3 à 5€ / jour"
            ]
          }
        ]
      },
      {
        ico: "⛵",
        title: "Bateaux inter-îles",
        content: [
          {
            type: "p",
            text: "Pour **Nusa Penida**, les **Gili** ou **Lombok**. Les bateaux peuvent être annulés selon la météo — garde un peu de flexibilité dans ton planning."
          },
          {
            type: "link",
            url: "https://12go.com/en/",
            label: "Réserver sur 12GO Asia"
          }
        ]
      },
      {
        ico: "🚌",
        title: "Bus & Shuttle",
        content: [
          {
            type: "p",
            text: "Pratique si tu voyages **solo** ou avec un petit budget."
          },
          {
            type: "link",
            url: "https://peramatour.com/b/en/shuttle-bus",
            label: "Perama — Navettes Bali"
          },
          {
            type: "link",
            url: "https://www.easybook.com/ms-my",
            label: "Easybook — Java"
          }
        ]
      },
      {
        ico: "🚂",
        title: "Trains à Java",
        content: [
          {
            type: "p",
            text: "Si tu combines **Bali et Java**, réserve tes trains via Traveloka — Yogyakarta, Malang, Surabaya."
          },
          {
            type: "link",
            url: "https://www.traveloka.com/",
            label: "Ouvrir Traveloka"
          },
          {
            type: "link",
            url: "https://apps.apple.com/id/app/traveloka-book-flight-hotel/id694892080",
            label: "🍎 App Store (iPhone)"
          },
          {
            type: "link",
            url: "https://play.google.com/store/apps/details?id=com.traveloka.htlexpress",
            label: "🤖 Play Store (Android)"
          }
        ]
      }
    ]
  },
  {
    key: "valise",
    title: "🧳 Valise",
    intro: "Ne te surcharge pas, voyage léger.",
    blocks: [
      {
        ico: "✅",
        title: "À prendre absolument",
        content: [
          {
            type: "grid",
            gridItems: [
              {
                emoji: "🧥",
                label: "Pull léger",
                note: "Avion, ferry & volcan",
                kind: "good"
              },
              {
                emoji: "🌂",
                label: "K-way fin",
                note: "Pluies & fraîcheur",
                kind: "good"
              },
              {
                emoji: "🧣",
                label: "Vêtements couvrants",
                note: "Foulard + jupe longue pour les temples",
                kind: "good"
              },
              {
                emoji: "🏊",
                label: "Serviette microfibre",
                note: "Légère & séchage rapide",
                kind: "good"
              },
              {
                emoji: "👟",
                label: "Chaussures confort",
                note: "Marches & trottoirs irréguliers",
                kind: "good"
              },
              {
                emoji: "🦟",
                label: "Anti-moustique",
                note: "Ubud, rizières & îles",
                kind: "good"
              }
            ]
          }
        ]
      },
      {
        ico: "❌",
        title: "À éviter",
        content: [
          {
            type: "grid",
            gridItems: [
              {
                emoji: "👚",
                label: "Trop de vêtements",
                note: "Laveries partout & pas chères",
                kind: "bad"
              },
              {
                emoji: "👠",
                label: "Talons hauts",
                note: "Pas adapté à Bali",
                kind: "bad"
              },
              {
                emoji: "🛁",
                label: "Grande serviette",
                note: "Trop lourde & volumineuse",
                kind: "bad"
              },
              {
                emoji: "🔌",
                label: "Adaptateur",
                note: "Prises compatibles FR/ID",
                kind: "bad"
              },
              {
                emoji: "☂️",
                label: "Parapluie",
                note: "K-way bien plus pratique",
                kind: "bad"
              },
              {
                emoji: "📦",
                label: "\"Au cas où\"",
                note: "Tu porteras juste plus lourd",
                kind: "bad"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    key: "sante",
    title: "🏥 Santé",
    intro: "Quelques précautions simples pour voyager l'esprit tranquille.",
    blocks: [
      {
        ico: "🛡️",
        title: "Assurance voyage",
        content: [
          {
            type: "p",
            text: "Vérifie ce que ta carte bancaire couvre (rapatriement, frais d'hospitalisation). Si c'est insuffisant, une **assurance dédiée est recommandée**."
          },
          {
            type: "tags",
            items: [
              "Chapka",
              "Heymondo",
              "ACS"
            ]
          }
        ]
      },
      {
        ico: "💉",
        title: "Vaccins",
        content: [
          {
            type: "p",
            text: "**Aucun vaccin n'est obligatoire** pour entrer en Indonésie."
          },
          {
            type: "p",
            text: "Fais le point avec ton médecin traitant avant le départ selon ton dossier médical."
          }
        ]
      },
      {
        ico: "🎒",
        title: "Trousse médicale",
        content: [
          {
            type: "tags",
            items: [
              "Doliprane",
              "Spasfon",
              "Antidiarrhéique",
              "Crème solaire",
              "Anti-moustique",
              "Désinfectant"
            ]
          },
          {
            type: "p",
            text: "Ordonnance obligatoire pour les traitements spécifiques. Nombreuses pharmacies sur place pour les médicaments de base."
          }
        ]
      },
      {
        ico: "🍽️",
        title: "Alimentation & eau",
        content: [
          {
            type: "list",
            items: [
              "**Eau :** évite celle du robinet (non potable), privilégie l'eau en bouteille.",
              "**Glaçons :** généralement sans problème, fabriqués industriellement.",
              "**Crudités :** attention à celles non épluchées ou mal lavées.",
              "**Viande & poisson :** privilégie les aliments bien cuits.",
              "**Street food :** si tu as un ventre fragile, vas-y progressivement les premiers jours."
            ]
          }
        ]
      }
    ]
  },
  {
    key: "urgence",
    title: "🚨 Urgence",
    intro: "À garder sous la main au cas où.",
    blocks: [
      {
        ico: "🚑",
        title: "Numéros d'urgence",
        content: [
          {
            type: "p",
            text: "⚠️ **Coût des appels :** depuis une SIM française, des frais internationaux s'appliquent. Depuis une **SIM locale indonésienne**, les appels sont gratuits ou quasi-gratuits."
          },
          {
            type: "link",
            url: "tel:110",
            label: "🚔 Police — 110"
          },
          {
            type: "link",
            url: "tel:112",
            label: "🚑 Ambulance — 112"
          },
          {
            type: "link",
            url: "tel:113",
            label: "🚒 Pompiers — 113"
          },
          {
            type: "link",
            url: "tel:+622123557600",
            label: "🇫🇷 Ambassade de France à Jakarta"
          },
          {
            type: "p",
            text: "Ces numéros ne fonctionnent **pas sur WhatsApp** — appel classique uniquement."
          }
        ]
      },
      {
        ico: "🏥",
        title: "Cliniques — Denpasar",
        content: [
          {
            type: "link",
            url: "tel:+62361484748",
            label: "🏥 Bali Méd Hospital — +62 361 484748"
          },
          {
            type: "link",
            url: "tel:+62361761263",
            label: "🏥 BIMC Denpasar — +62 361 761 263"
          }
        ]
      },
      {
        ico: "🏥",
        title: "Cliniques — Ubud",
        content: [
          {
            type: "link",
            url: "tel:+6282298298911",
            label: "🏥 Unicare Clinic (24h) — +62 822 9829 8911"
          },
          {
            type: "link",
            url: "tel:+62361209103",
            label: "🏥 BIMC Ubud — +62 361 209 1030"
          }
        ]
      },
      {
        ico: "🏥",
        title: "Cliniques — Kuta / Canggu",
        content: [
          {
            type: "link",
            url: "tel:+62361779911",
            label: "🏥 Siloam Kuta — +62 361 779911"
          },
          {
            type: "link",
            url: "tel:+62361761263",
            label: "🏥 BIMC Kuta — +62 361 761263"
          }
        ]
      },
      {
        ico: "🏥",
        title: "Cliniques — Nusa Dua",
        content: [
          {
            type: "link",
            url: "tel:+62361300911",
            label: "🏥 BIMC Nusa Dua — +62 361 300 911"
          }
        ]
      },
      {
        ico: "🏥",
        title: "Cliniques — Amed / Sidemen",
        content: [
          {
            type: "p",
            text: "**Amed**"
          },
          {
            type: "link",
            url: "tel:+6236323445",
            label: "🏥 Klinik Pratama Amed — +62 363 23445"
          },
          {
            type: "p",
            text: "**Sidemen**"
          },
          {
            type: "link",
            url: "tel:+6236621440",
            label: "🏥 RSUD Klungkung — +62 366 21440"
          }
        ]
      },
      {
        ico: "💡",
        title: "Conseil",
        content: [
          {
            type: "p",
            text: "Les assurances demandent souvent à être **appelées avant un soin**. Elles peuvent te guider vers une clinique partenaire et faciliter la prise en charge directe."
          }
        ]
      }
    ]
  }
];
