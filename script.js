/* ================================================================
   StrideLab — script.js
   Contient :
   1. Données du formulaire (18 étapes)
   2. Base de données chaussures
   3. Algorithme de scoring
   4. Logique de navigation du formulaire
   5. Génération des résultats
   ================================================================ */

'use strict';

/* ================================================================
   1. DÉFINITION DES ÉTAPES DU FORMULAIRE
   ================================================================ */

const STEPS = [
  // ── Étape 1 : Pointure ─────────────────────────────────────────
  {
    id: 'pointure',
    category: 'Morphologie du pied',
    title: 'Quelle est ta pointure ?',
    hint: 'Indique ta pointure habituelle en chaussures de ville (EU). Pour la course, on recommande généralement 0,5 à 1 taille de plus.',
    tooltip: '💡 La majorité des coureurs prennent leurs chaussures trop petites. Prévois de la place pour l\'expansion du pied à l\'effort.',
    type: 'number',
    key: 'pointure',
    min: 35, max: 50, step: 0.5, defaultVal: 42,
    unit: 'EU',
  },

  // ── Étape 2 : Largeur / Longueur du pied ────────────────────────
  {
    id: 'largeur_pied',
    category: 'Morphologie du pied',
    title: 'Quelle est la forme de ton pied ?',
    hint: 'La largeur influence fortement le chaussant et le confort.',
    type: 'options',
    key: 'largeur_pied',
    cols: 3,
    options: [
      { value: 'etroit', icon: '↔', label: 'Pied étroit', desc: 'Pied fin, étroit' },
      { value: 'normal', icon: '◻', label: 'Standard', desc: 'Largeur normale' },
      { value: 'large',  icon: '⬜', label: 'Pied large', desc: 'Avant-pied évasé' },
      { value: 'long_fin', icon: '↕', label: 'Long et fin', desc: 'Pied allongé et étroit' },
    ],
  },

  // ── Étape 3 : Voûte plantaire ────────────────────────────────────
  {
    id: 'voute',
    category: 'Morphologie du pied',
    title: 'Quelle est ta voûte plantaire ?',
    hint: 'La voûte détermine le type de soutien dont tu as besoin.',
    tooltip: '💡 Test rapide : mouille ton pied et pose-le sur une feuille. Si tu vois tout le dessous du pied → voûte basse. Si tu vois une fine bande → voûte haute.',
    type: 'options',
    key: 'voute',
    cols: 3,
    options: [
      { value: 'basse',   icon: '🦶', label: 'Voûte basse', desc: 'Pied plat, empreinte complète' },
      { value: 'normale', icon: '🦶', label: 'Voûte normale', desc: 'Courbe légère, standard' },
      { value: 'haute',   icon: '🦶', label: 'Voûte haute', desc: 'Creuse, peu de contact au sol' },
    ],
  },

  // ── Étape 4 : Forme des orteils ─────────────────────────────────
  {
    id: 'orteils',
    category: 'Morphologie du pied',
    title: 'Quelle est la forme de tes orteils ?',
    hint: 'La forme de tes orteils influence le risque de conflit et d\'ongles noirs.',
    type: 'options',
    key: 'orteils',
    cols: 3,
    options: [
      { value: 'egyptien', icon: '👣', label: 'Égyptien', desc: 'Gros orteil le plus long' },
      { value: 'grec',     icon: '👣', label: 'Grec', desc: '2e orteil plus long que le gros orteil' },
      { value: 'carre',    icon: '👣', label: 'Carré', desc: 'Orteils approximativement de même longueur' },
    ],
  },

  // ── Étape 5 : Poids ─────────────────────────────────────────────
  {
    id: 'poids',
    category: 'Profil physique',
    title: 'Quel est ton poids approximatif ?',
    hint: 'Le poids influence l\'amorti nécessaire et la durabilité des mousses.',
    type: 'number',
    key: 'poids',
    min: 40, max: 130, step: 1, defaultVal: 70,
    unit: 'kg',
  },

  // ── Étape 6 : Type de foulée ────────────────────────────────────
  {
    id: 'foulee',
    category: 'Biomécanique',
    title: 'Quel est ton type de foulée ?',
    hint: 'Si tu ne sais pas, un test en magasin spécialisé ou une vidéo de toi en train de courir peut t\'aider.',
    tooltip: '💡 Pronateur : le pied s\'effondre vers l\'intérieur. Supinateur : le pied roule vers l\'extérieur. Neutre : alignement naturel.',
    type: 'options',
    key: 'foulee',
    cols: 3,
    options: [
      { value: 'neutre',      icon: '⬆', label: 'Neutre', desc: 'Foulée alignée, sans effondrement' },
      { value: 'pronateur',   icon: '↙', label: 'Pronateur', desc: 'Pied qui s\'effondre vers l\'intérieur' },
      { value: 'supinateur',  icon: '↗', label: 'Supinateur', desc: 'Pied qui roule vers l\'extérieur' },
      { value: 'je_sais_pas', icon: '❓', label: 'Je ne sais pas', desc: 'Jamais analysé ma foulée' },
    ],
  },

  // ── Étape 7 : Attaque du pied ────────────────────────────────────
  {
    id: 'attaque',
    category: 'Biomécanique',
    title: 'Comment ton pied attaque le sol ?',
    hint: 'L\'attaque détermine la zone d\'amorti prioritaire et le drop recommandé.',
    tooltip: '💡 Attaque talon : le talon touche le sol en premier. Médio-pied : c\'est le milieu du pied. Avant-pied : les orteils arrivent en premier.',
    type: 'options',
    key: 'attaque',
    cols: 3,
    options: [
      { value: 'talon',      icon: '👟', label: 'Talon', desc: 'Le talon touche le sol en premier' },
      { value: 'mediopied',  icon: '👟', label: 'Médio-pied', desc: 'Milieu du pied, foulée intermédiaire' },
      { value: 'avantpied',  icon: '👟', label: 'Avant-pied', desc: 'Avant-pied et orteils en premier' },
    ],
  },

  // ── Étape 8 : Âge ───────────────────────────────────────────────
  {
    id: 'age',
    category: 'Profil physique',
    title: 'Quel est ton âge ?',
    hint: 'L\'âge influence la récupération tendineuse et les besoins en protection.',
    type: 'number',
    key: 'age',
    min: 15, max: 80, step: 1, defaultVal: 35,
    unit: 'ans',
  },

  // ── Étape 9 : Antécédents de blessures ──────────────────────────
  {
    id: 'blessures',
    category: 'Santé & Blessures',
    title: 'As-tu des antécédents de blessures ?',
    hint: 'Sélectionne toutes les blessures que tu as déjà eues ou dont tu souffres actuellement. Ce paramètre est crucial pour ta recommandation.',
    type: 'multi',
    key: 'blessures',
    options: [
      { value: 'aucune',         icon: '✅', label: 'Aucune blessure', desc: 'Pas de problème particulier' },
      { value: 'achille',        icon: '🦵', label: 'Tendinite Achille', desc: 'Douleur au tendon d\'Achille' },
      { value: 'apo_plantaire',  icon: '🦶', label: 'Aponévrosite plantaire', desc: 'Fasciite plantaire, douleur sous le talon' },
      { value: 'genou',          icon: '🦴', label: 'Syndrome rotulien / Genou', desc: 'Douleur devant ou autour du genou' },
      { value: 'tfl',            icon: '🏃', label: 'TFL / Bandelette ilio-tibiale', desc: 'Douleur externe du genou ou de la hanche' },
      { value: 'fracture_fatigue', icon: '⚠️', label: 'Fracture de fatigue', desc: 'Micro-fracture liée à la répétition' },
      { value: 'entorse_cheville', icon: '🔄', label: 'Entorse de cheville', desc: 'Cheville instable ou fragilisée' },
    ],
  },

  // ── Étape 10 : Surface principale ───────────────────────────────
  {
    id: 'surface',
    category: 'Pratique',
    title: 'Sur quelle surface cours-tu principalement ?',
    hint: 'La surface détermine le type d\'accroche et la durabilité de la semelle extérieure.',
    type: 'options',
    key: 'surface',
    cols: 3,
    options: [
      { value: 'route',  icon: '🏙️', label: 'Route / Bitume', desc: 'Asphalte, béton, pistes' },
      { value: 'trail',  icon: '🌲', label: 'Trail / Sentiers', desc: 'Chemins, terre, montagne' },
      { value: 'mixte',  icon: '🔀', label: 'Mixte', desc: 'Route et trail en alternance' },
    ],
  },

  // ── Étape 11 : Fréquence hebdomadaire ──────────────────────────
  {
    id: 'frequence',
    category: 'Pratique',
    title: 'Quelle est ta fréquence d\'entraînement ?',
    hint: 'La fréquence détermine la durabilité nécessaire et l\'intérêt d\'une rotation de chaussures.',
    type: 'options',
    key: 'frequence',
    cols: 2,
    options: [
      { value: '1_2',  icon: '🗓️', label: '1–2 séances / semaine', desc: 'Pratique occasionnelle ou débutant' },
      { value: '3_5',  icon: '📅', label: '3–5 séances / semaine', desc: 'Pratique régulière, niveau intermédiaire' },
      { value: '6+',   icon: '🔥', label: '6 séances et plus', desc: 'Entraînement intensif ou compétition' },
    ],
  },

  // ── Étape 12 : Distance moyenne ────────────────────────────────
  {
    id: 'distance',
    category: 'Pratique',
    title: 'Quelle distance parcours-tu par sortie ?',
    hint: 'La distance influence le besoin de confort longue durée et la stabilité en fin d\'effort.',
    type: 'options',
    key: 'distance',
    cols: 3,
    options: [
      { value: 'moins10',  icon: '⚡', label: 'Moins de 10 km', desc: 'Sorties courtes, entraînements fractionnés' },
      { value: '10_20',    icon: '🏃', label: '10 à 20 km', desc: 'Sorties intermédiaires, semi-marathon' },
      { value: 'plus20',   icon: '🏅', label: 'Plus de 20 km', desc: 'Long run, marathon, ultra' },
    ],
  },

  // ── Étape 13 : Objectif des séances ────────────────────────────
  {
    id: 'objectif',
    category: 'Objectifs',
    title: 'Quel est l\'objectif principal de tes séances ?',
    hint: 'L\'objectif détermine le niveau de dynamisme et de protection nécessaire.',
    type: 'options',
    key: 'objectif',
    cols: 2,
    options: [
      { value: 'ef',          icon: '😌', label: 'Endurance fondamentale', desc: 'Footing facile, récupération, confort' },
      { value: 'seuil',       icon: '🎯', label: 'Seuil / Tempo', desc: 'Allures marathon, travail à seuil' },
      { value: 'vma',         icon: '⚡', label: 'VMA / Fractionné', desc: 'Répétitions rapides, intervalles' },
      { value: 'competition', icon: '🏆', label: 'Compétition', desc: 'Marathon, trail, course officielle' },
      { value: 'loisir',      icon: '🌿', label: 'Loisir / Bien-être', desc: 'Plaisir, perte de poids, santé' },
    ],
  },

  // ── Étape 14 : Drop souhaité ────────────────────────────────────
  {
    id: 'drop',
    category: 'Préférences techniques',
    title: 'Quel drop préfères-tu ?',
    hint: 'Le drop est la différence de hauteur entre le talon et l\'avant de la chaussure. Plus il est faible, plus la chaussure est "naturelle".',
    tooltip: '💡 Drop 0 : chaussure plate, naturelle. Drop 12mm : chaussure haute au talon, protège l\'Achille. Recommandé 6–8mm pour la plupart.',
    type: 'options',
    key: 'drop',
    cols: 2,
    options: [
      { value: 'zero',    icon: '⬛', label: 'Drop 0–3 mm', desc: 'Très naturel — coureurs expérimentés uniquement' },
      { value: 'bas',     icon: '◾', label: 'Drop 4–5 mm', desc: 'Faible, tonique' },
      { value: 'moyen',   icon: '▪', label: 'Drop 6–8 mm', desc: 'Universel, le plus polyvalent' },
      { value: 'eleve',   icon: '◼', label: 'Drop 10–12 mm', desc: 'Protecteur, recommandé si problème d\'Achille' },
      { value: 'pas_de_preference', icon: '🎲', label: 'Pas de préférence', desc: 'Je fais confiance à la recommandation' },
    ],
  },

  // ── Étape 15 : Fermeté de l'amorti ─────────────────────────────
  {
    id: 'fermete',
    category: 'Préférences techniques',
    title: 'Quelle sensation de sol préfères-tu ?',
    hint: 'Souple = sensation "nuage", fort amorti. Ferme = retour d\'énergie, plus dynamique.',
    type: 'options',
    key: 'fermete',
    cols: 3,
    options: [
      { value: 'souple', icon: '☁️', label: 'Souple / Moelleux', desc: 'Amorti généreux, sensation de confort' },
      { value: 'moyen',  icon: '⚖️', label: 'Équilibré', desc: 'Compromis amorti / réactivité' },
      { value: 'ferme',  icon: '⚡', label: 'Ferme / Réactif', desc: 'Proche du sol, dynamisme' },
    ],
  },

  // ── Étape 16 : Largeur toe-box ──────────────────────────────────
  {
    id: 'toebox',
    category: 'Préférences techniques',
    title: 'Quelle largeur de toe-box (avant du pied) préfères-tu ?',
    hint: 'La toe-box est l\'espace réservé à tes orteils dans la chaussure.',
    tooltip: '💡 Toe-box large : orteils libres, confort sur longue distance. Standard : polyvalent. Étroit : performance pure, pied fin.',
    type: 'options',
    key: 'toebox',
    cols: 3,
    options: [
      { value: 'large',    icon: '⬜', label: 'Large', desc: 'Orteils libres, idéal longues distances' },
      { value: 'standard', icon: '◻', label: 'Standard', desc: 'Polyvalent, le plus courant' },
      { value: 'etroit',   icon: '▭', label: 'Étroit', desc: 'Performance, pied fin' },
    ],
  },

  // ── Étape 17 : Budget ────────────────────────────────────────────
  {
    id: 'budget',
    category: 'Budget',
    title: 'Quel est ton budget maximum ?',
    hint: 'Glisse le curseur pour définir ton budget. Les meilleures chaussures se trouvent souvent entre 120€ et 200€.',
    type: 'slider',
    key: 'budget',
    min: 50, max: 300, step: 10, defaultVal: 150,
    unit: '€',
  },

  // ── Étape 18 : Semelles orthopédiques ──────────────────────────
  {
    id: 'orthopedique',
    category: 'Équipement',
    title: 'Utilises-tu des semelles orthopédiques ?',
    hint: 'Les semelles orthopédiques nécessitent une chaussure avec une semelle amovible et un volume intérieur adapté.',
    type: 'options',
    key: 'orthopedique',
    cols: 2,
    options: [
      { value: 'oui', icon: '✅', label: 'Oui', desc: 'J\'utilise des semelles orthopédiques prescrites ou de confort' },
      { value: 'non', icon: '❌', label: 'Non', desc: 'Je n\'utilise pas de semelles spéciales' },
    ],
  },
];

/* ================================================================
   LABELS DE PROGRESSION (affiché dans la barre)
   ================================================================ */
const STEP_LABELS = [
  'Morphologie · Pointure',
  'Morphologie · Largeur',
  'Morphologie · Voûte',
  'Morphologie · Orteils',
  'Profil · Poids',
  'Biomécanique · Foulée',
  'Biomécanique · Attaque',
  'Profil · Âge',
  'Santé · Blessures',
  'Pratique · Surface',
  'Pratique · Fréquence',
  'Pratique · Distance',
  'Objectifs · Séances',
  'Technique · Drop',
  'Technique · Fermeté',
  'Technique · Toe-box',
  'Budget',
  'Équipement · Orthèses',
];

/* ================================================================
   2. BASE DE DONNÉES CHAUSSURES
   Chaque chaussure a des scores de 1–10 et des données techniques.
   ================================================================ */

const SHOES_DB = [
  // ── ROUTE — Grand confort ──────────────────────────────────────
  {
    id: 'asics-gel-nimbus-26',
    brand: 'ASICS',
    model: 'Gel-Nimbus 26',
    surface: ['route', 'mixte'],
    drop: 10,
    dropCat: 'eleve',
    weight: 282,
    price: 180,
    toebox: 'standard',
    scores: { amorti: 9, stabilite: 7, dynamisme: 5, rigidite: 4, accroche: 5 },
    tags: ['Gel ASICS', 'FF Blast+', '10mm drop', '282g'],
    pros: ['Amorti exceptionnel', 'Excellent pour longues distances', 'Protège les articulations'],
    cons: ['Peu dynamique', 'Lourd pour la compétition'],
    objectives: ['ef', 'loisir'],
    foulee: ['neutre', 'pronateur', 'je_sais_pas'],
    poidsCat: 'tous',
    orthopedique: true,
    icon: '👟',
  },
  {
    id: 'brooks-ghost-16',
    brand: 'BROOKS',
    model: 'Ghost 16',
    surface: ['route', 'mixte'],
    drop: 12,
    dropCat: 'eleve',
    weight: 269,
    price: 140,
    toebox: 'standard',
    scores: { amorti: 8, stabilite: 7, dynamisme: 5, rigidite: 4, accroche: 5 },
    tags: ['DNA Loft v3', '12mm drop', '269g', 'Fit adaptable'],
    pros: ['Très polyvalent', 'Excellent rapport qualité/prix', 'Largeur disponible'],
    cons: ['Pas le plus dynamique'],
    objectives: ['ef', 'loisir', 'seuil'],
    foulee: ['neutre', 'je_sais_pas'],
    poidsCat: 'tous',
    orthopedique: true,
    icon: '👟',
  },
  {
    id: 'hoka-clifton-9',
    brand: 'HOKA',
    model: 'Clifton 9',
    surface: ['route', 'mixte'],
    drop: 5,
    dropCat: 'bas',
    weight: 252,
    price: 145,
    toebox: 'large',
    scores: { amorti: 9, stabilite: 6, dynamisme: 6, rigidite: 3, accroche: 5 },
    tags: ['Stack maximaliste', '5mm drop', '252g', 'Toe-box large'],
    pros: ['Stack maximaliste ultra confortable', 'Léger pour le volume d\'amorti', 'Toe-box généreuse'],
    cons: ['Drop bas déconseillé si tendinite Achille', 'Instable en virage'],
    objectives: ['ef', 'loisir'],
    foulee: ['neutre', 'je_sais_pas'],
    poidsCat: 'tous',
    orthopedique: true,
    icon: '👟',
  },
  {
    id: 'new-balance-fresh-foam-1080v13',
    brand: 'NEW BALANCE',
    model: '1080 v13',
    surface: ['route'],
    drop: 8,
    dropCat: 'moyen',
    weight: 272,
    price: 175,
    toebox: 'standard',
    scores: { amorti: 9, stabilite: 6, dynamisme: 6, rigidite: 4, accroche: 4 },
    tags: ['Fresh Foam X', '8mm drop', '272g'],
    pros: ['Mousse Fresh Foam X premium', 'Confort longue durée exceptionnel', 'Polyvalent allures'],
    cons: ['Prix élevé', 'Peu adapté au trail'],
    objectives: ['ef', 'seuil', 'loisir'],
    foulee: ['neutre', 'supinateur'],
    poidsCat: 'tous',
    orthopedique: true,
    icon: '👟',
  },

  // ── ROUTE — Performance / Seuil ─────────────────────────────────
  {
    id: 'nike-pegasus-41',
    brand: 'NIKE',
    model: 'Air Zoom Pegasus 41',
    surface: ['route', 'mixte'],
    drop: 10,
    dropCat: 'eleve',
    weight: 283,
    price: 130,
    toebox: 'standard',
    scores: { amorti: 7, stabilite: 6, dynamisme: 7, rigidite: 5, accroche: 6 },
    tags: ['React + Air Zoom', '10mm drop', '283g'],
    pros: ['Référence polyvalence', 'Prix accessible', 'Dynamique pour l\'allure'],
    cons: ['Toe-box un peu étroite', 'Semelle pas la plus durable'],
    objectives: ['ef', 'seuil', 'loisir'],
    foulee: ['neutre', 'je_sais_pas'],
    poidsCat: 'tous',
    orthopedique: false,
    icon: '👟',
  },
  {
    id: 'adidas-supernova-rise-2',
    brand: 'ADIDAS',
    model: 'Supernova Rise 2',
    surface: ['route'],
    drop: 10,
    dropCat: 'eleve',
    weight: 278,
    price: 120,
    toebox: 'standard',
    scores: { amorti: 8, stabilite: 7, dynamisme: 6, rigidite: 5, accroche: 5 },
    tags: ['DREAMSTRIKE+', '10mm drop', '278g'],
    pros: ['Excellent rapport qualité/prix', 'Bonne stabilité légère', 'Confort quotidien'],
    cons: ['Pas pour les compétitions'],
    objectives: ['ef', 'loisir'],
    foulee: ['neutre', 'pronateur'],
    poidsCat: 'tous',
    orthopedique: true,
    icon: '👟',
  },

  // ── ROUTE — Super Shoes / Compétition ──────────────────────────
  {
    id: 'nike-vaporfly-3',
    brand: 'NIKE',
    model: 'Vaporfly 3',
    surface: ['route'],
    drop: 8,
    dropCat: 'moyen',
    weight: 190,
    price: 265,
    toebox: 'etroit',
    scores: { amorti: 8, stabilite: 5, dynamisme: 10, rigidite: 9, accroche: 5 },
    tags: ['Plaque carbone', 'PEBA ZoomX', '8mm drop', '190g', 'Super Shoe'],
    pros: ['Retour d\'énergie exceptionnel', 'Ultra léger', 'Gain de performance prouvé'],
    cons: ['Réservé aux coureurs expérimentés', 'Toe-box étroite', 'Durée de vie courte'],
    objectives: ['competition', 'vma'],
    foulee: ['neutre'],
    poidsCat: 'leger',
    orthopedique: false,
    icon: '⚡',
  },
  {
    id: 'adidas-adizero-adios-pro-3',
    brand: 'ADIDAS',
    model: 'Adizero Adios Pro 3',
    surface: ['route'],
    drop: 6,
    dropCat: 'moyen',
    weight: 220,
    price: 250,
    toebox: 'etroit',
    scores: { amorti: 8, stabilite: 5, dynamisme: 10, rigidite: 9, accroche: 5 },
    tags: ['LIGHTSTRIKE PRO', '5 tiges EnergyRods', '6mm drop', '220g'],
    pros: ['Technologie de pointe', 'Propulsion maximale', 'Plusieurs allures'],
    cons: ['Prix très élevé', 'Spécifique compétition'],
    objectives: ['competition', 'vma'],
    foulee: ['neutre'],
    poidsCat: 'leger',
    orthopedique: false,
    icon: '⚡',
  },

  // ── ROUTE — Stabilité ───────────────────────────────────────────
  {
    id: 'asics-gel-kayano-31',
    brand: 'ASICS',
    model: 'Gel-Kayano 31',
    surface: ['route'],
    drop: 10,
    dropCat: 'eleve',
    weight: 310,
    price: 200,
    toebox: 'standard',
    scores: { amorti: 8, stabilite: 9, dynamisme: 4, rigidite: 5, accroche: 5 },
    tags: ['4D Guidance System', 'Gel ASICS', '10mm drop', '310g', 'Stabilité'],
    pros: ['Stabilité maximale pour pronateurs', 'Amorti généreux', 'Durable'],
    cons: ['Lourd', 'Peu dynamique'],
    objectives: ['ef', 'loisir'],
    foulee: ['pronateur'],
    poidsCat: 'tous',
    orthopedique: true,
    icon: '🏃',
  },
  {
    id: 'brooks-adrenaline-gts-24',
    brand: 'BROOKS',
    model: 'Adrenaline GTS 24',
    surface: ['route', 'mixte'],
    drop: 12,
    dropCat: 'eleve',
    weight: 278,
    price: 135,
    toebox: 'standard',
    scores: { amorti: 7, stabilite: 9, dynamisme: 5, rigidite: 5, accroche: 5 },
    tags: ['GuideRails', '12mm drop', '278g', 'Anti-pronation'],
    pros: ['Technologie GuideRails brevetée', 'Idéal pronateurs', 'Excellent rapport Q/P'],
    cons: ['Drop élevé'],
    objectives: ['ef', 'loisir'],
    foulee: ['pronateur'],
    poidsCat: 'tous',
    orthopedique: true,
    icon: '🏃',
  },

  // ── TRAIL ───────────────────────────────────────────────────────
  {
    id: 'hoka-speedgoat-6',
    brand: 'HOKA',
    model: 'Speedgoat 6',
    surface: ['trail'],
    drop: 4,
    dropCat: 'bas',
    weight: 293,
    price: 165,
    toebox: 'large',
    scores: { amorti: 8, stabilite: 7, dynamisme: 6, rigidite: 5, accroche: 9 },
    tags: ['Vibram Megagrip', '4mm drop', '293g', 'Protection renforcée'],
    pros: ['Grip Vibram légendaire', 'Protection maximale des pieds', 'Polyvalent sur tous terrains'],
    cons: ['Drop très bas, attention tendon Achille', 'Lourd'],
    objectives: ['ef', 'loisir', 'competition'],
    foulee: ['neutre', 'je_sais_pas'],
    poidsCat: 'tous',
    orthopedique: false,
    icon: '🌲',
  },
  {
    id: 'salomon-sense-ride-5',
    brand: 'SALOMON',
    model: 'Sense Ride 5',
    surface: ['trail', 'mixte'],
    drop: 6,
    dropCat: 'moyen',
    weight: 270,
    price: 140,
    toebox: 'standard',
    scores: { amorti: 7, stabilite: 8, dynamisme: 7, rigidite: 6, accroche: 8 },
    tags: ['Contagrip TA', '6mm drop', '270g'],
    pros: ['Polyvalent sentiers mixtes', 'Excellent rapport Q/P trail', 'Dynamique'],
    cons: ['Pas pour trail très technique'],
    objectives: ['ef', 'seuil', 'competition', 'loisir'],
    foulee: ['neutre', 'je_sais_pas'],
    poidsCat: 'tous',
    orthopedique: true,
    icon: '🌲',
  },
  {
    id: 'scott-kinabalu-3',
    brand: 'SCOTT',
    model: 'Kinabalu 3',
    surface: ['trail'],
    drop: 8,
    dropCat: 'moyen',
    weight: 305,
    price: 160,
    toebox: 'large',
    scores: { amorti: 8, stabilite: 8, dynamisme: 5, rigidite: 5, accroche: 9 },
    tags: ['Grip de haute montagne', '8mm drop', '305g', 'Toe-box large'],
    pros: ['Excellent sur terrain humide et détrempé', 'Protection maximale', 'Toe-box généreuse'],
    cons: ['Lourd', 'Peu adapté à la route'],
    objectives: ['ef', 'loisir'],
    foulee: ['neutre', 'je_sais_pas', 'pronateur'],
    poidsCat: 'tous',
    orthopedique: true,
    icon: '🏔️',
  },
  {
    id: 'altra-lone-peak-8',
    brand: 'ALTRA',
    model: 'Lone Peak 8',
    surface: ['trail'],
    drop: 0,
    dropCat: 'zero',
    weight: 298,
    price: 155,
    toebox: 'large',
    scores: { amorti: 6, stabilite: 7, dynamisme: 6, rigidite: 4, accroche: 8 },
    tags: ['Drop 0', 'FootShape', '298g', 'Plateforme large'],
    pros: ['Toe-box la plus large du marché', 'Drop 0 naturel', 'Ideal pied large'],
    cons: ['Drop 0 → déconseillé si problème Achille ou débutant', 'Adaptation nécessaire'],
    objectives: ['ef', 'loisir'],
    foulee: ['neutre'],
    poidsCat: 'tous',
    orthopedique: false,
    icon: '🌲',
  },

  // ── POLYVALENT Entrée de gamme ──────────────────────────────────
  {
    id: 'asics-gel-cumulus-26',
    brand: 'ASICS',
    model: 'Gel-Cumulus 26',
    surface: ['route', 'mixte'],
    drop: 8,
    dropCat: 'moyen',
    weight: 279,
    price: 135,
    toebox: 'standard',
    scores: { amorti: 7, stabilite: 6, dynamisme: 6, rigidite: 5, accroche: 6 },
    tags: ['FF Blast+', 'Gel talon', '8mm drop', '279g'],
    pros: ['Très polyvalent allures', 'Prix raisonnable', 'Semelle durable'],
    cons: ['Pas le plus protecteur'],
    objectives: ['ef', 'seuil', 'loisir'],
    foulee: ['neutre', 'je_sais_pas'],
    poidsCat: 'tous',
    orthopedique: true,
    icon: '👟',
  },
  {
    id: 'saucony-guide-17',
    brand: 'SAUCONY',
    model: 'Guide 17',
    surface: ['route'],
    drop: 8,
    dropCat: 'moyen',
    weight: 263,
    price: 130,
    toebox: 'standard',
    scores: { amorti: 7, stabilite: 8, dynamisme: 5, rigidite: 5, accroche: 5 },
    tags: ['PWRRUN+', '8mm drop', '263g', 'Stabilité légère'],
    pros: ['Stabilité légère accessible', 'Léger pour chaussure guidance', 'Confort quotidien'],
    cons: ['Peu adapté longues compétitions'],
    objectives: ['ef', 'loisir'],
    foulee: ['pronateur', 'neutre'],
    poidsCat: 'tous',
    orthopedique: true,
    icon: '🏃',
  },
  {
    id: 'on-cloudmonster-2',
    brand: 'ON',
    model: 'Cloudmonster 2',
    surface: ['route'],
    drop: 6,
    dropCat: 'moyen',
    weight: 278,
    price: 185,
    toebox: 'standard',
    scores: { amorti: 9, stabilite: 5, dynamisme: 7, rigidite: 4, accroche: 5 },
    tags: ['CloudTec Phase', '6mm drop', '278g', 'Design On'],
    pros: ['Technologie CloudTec unique', 'Très rebondissant', 'Esthétique distinctive'],
    cons: ['Stabilité modérée', 'Prix élevé pour le segment EF'],
    objectives: ['ef', 'loisir'],
    foulee: ['neutre', 'supinateur'],
    poidsCat: 'tous',
    orthopedique: false,
    icon: '☁️',
  },
];

/* ================================================================
   3. ALGORITHME DE SCORING & RECOMMANDATION
   ================================================================ */

/**
 * Calcule un score de compatibilité entre 0 et 100
 * pour une chaussure donnée et un profil utilisateur.
 * Plus le score est élevé, plus la chaussure est adaptée.
 */
function scoreShoe(shoe, profile) {
  let score = 50; // score de base neutre
  const pen = []; // pénalités
  const bon = []; // bonus

  // ── Surface ─────────────────────────────────────────────────────
  if (shoe.surface.includes(profile.surface)) {
    bon.push(15);
  } else if (shoe.surface.includes('mixte') || profile.surface === 'mixte') {
    bon.push(5);
  } else {
    pen.push(25); // mauvaise surface = forte pénalité
  }

  // ── Budget ──────────────────────────────────────────────────────
  if (shoe.price <= profile.budget) {
    bon.push(10);
  } else if (shoe.price <= profile.budget * 1.15) {
    bon.push(2); // légèrement au-dessus
  } else {
    pen.push(20 + (shoe.price - profile.budget) / 5);
  }

  // ── Foulée / Stabilité ──────────────────────────────────────────
  if (shoe.foulee.includes(profile.foulee)) {
    bon.push(12);
  } else if (profile.foulee === 'je_sais_pas') {
    bon.push(5); // neutre
  } else {
    // chaussure neutre sur pronateur = légère pénalité
    if (profile.foulee === 'pronateur' && !shoe.foulee.includes('pronateur')) pen.push(8);
  }

  // ── Drop ────────────────────────────────────────────────────────
  const prefDrop = profile.drop;
  if (prefDrop !== 'pas_de_preference') {
    if (shoe.dropCat === prefDrop) {
      bon.push(10);
    } else {
      // compatibilité des drops adjacents
      const dropOrder = ['zero', 'bas', 'moyen', 'eleve'];
      const idx1 = dropOrder.indexOf(shoe.dropCat);
      const idx2 = dropOrder.indexOf(prefDrop);
      const diff = Math.abs(idx1 - idx2);
      if (diff === 1) bon.push(3);
      else if (diff >= 2) pen.push(10);
    }
  }

  // ── Toe-box ─────────────────────────────────────────────────────
  if (shoe.toebox === profile.toebox) {
    bon.push(8);
  } else if (profile.toebox === 'large' && shoe.toebox === 'etroit') {
    pen.push(15); // incompatibilité flagrante
  }

  // ── Objectif ────────────────────────────────────────────────────
  if (shoe.objectives.includes(profile.objectif)) {
    bon.push(12);
  }

  // ── Poids coureur ────────────────────────────────────────────────
  const poids = parseInt(profile.poids);
  if (poids > 80) {
    if (shoe.scores.amorti >= 7 && shoe.scores.stabilite >= 6) bon.push(8);
    if (shoe.poidsCat === 'leger') pen.push(12); // super shoes déconseillées coureur lourd
  } else if (poids < 65) {
    if (shoe.poidsCat === 'leger' || shoe.dynamisme >= 8) bon.push(5);
  }

  // ── Blessures (critère de santé majeur) ─────────────────────────
  if (profile.blessures && profile.blessures.length > 0) {

    // Tendinite Achille → drop élevé recommandé
    if (profile.blessures.includes('achille')) {
      if (shoe.drop >= 8) bon.push(12);
      if (shoe.drop <= 4) pen.push(20); // ALERTE
    }

    // Aponévrosite → amorti + rigidité modérée
    if (profile.blessures.includes('apo_plantaire')) {
      if (shoe.scores.amorti >= 7) bon.push(8);
    }

    // Syndrome rotulien → stabilité
    if (profile.blessures.includes('genou')) {
      if (shoe.scores.stabilite >= 7) bon.push(8);
    }

    // TFL → stabilité latérale
    if (profile.blessures.includes('tfl')) {
      if (shoe.scores.stabilite >= 7) bon.push(6);
    }

    // Fracture de fatigue → amorti maximal
    if (profile.blessures.includes('fracture_fatigue')) {
      if (shoe.scores.amorti >= 8) bon.push(10);
      if (shoe.poidsCat === 'leger') pen.push(8);
    }

    // Entorse cheville → base large + stabilité
    if (profile.blessures.includes('entorse_cheville')) {
      if (shoe.scores.stabilite >= 7) bon.push(8);
    }
  }

  // ── Âge ──────────────────────────────────────────────────────────
  const age = parseInt(profile.age);
  if (age > 45) {
    if (shoe.scores.amorti >= 7) bon.push(5);
    if (shoe.drop >= 8) bon.push(3);
  }

  // ── Fermeté souhaitée ────────────────────────────────────────────
  const ferm = profile.fermete;
  if (ferm === 'souple' && shoe.scores.amorti >= 8) bon.push(6);
  if (ferm === 'ferme' && shoe.scores.dynamisme >= 7) bon.push(6);
  if (ferm === 'moyen' && shoe.scores.amorti >= 6 && shoe.scores.dynamisme >= 5) bon.push(4);

  // ── Distance ─────────────────────────────────────────────────────
  if (profile.distance === 'plus20') {
    if (shoe.scores.amorti >= 7) bon.push(5);
  } else if (profile.distance === 'moins10') {
    if (shoe.scores.dynamisme >= 7) bon.push(5);
  }

  // ── Orthopédique ─────────────────────────────────────────────────
  if (profile.orthopedique === 'oui' && !shoe.orthopedique) {
    pen.push(12);
  }

  // ── Voûte plantaire ──────────────────────────────────────────────
  if (profile.voute === 'basse') {
    if (shoe.scores.stabilite >= 7) bon.push(6);
  } else if (profile.voute === 'haute') {
    if (shoe.scores.amorti >= 8 && shoe.scores.rigidite <= 5) bon.push(6);
  }

  // ── Pied large + toe-box ─────────────────────────────────────────
  if (profile.largeur_pied === 'large' && shoe.toebox === 'large') bon.push(8);
  if (profile.largeur_pied === 'large' && shoe.toebox === 'etroit') pen.push(15);

  // ── Forme orteils ────────────────────────────────────────────────
  if (profile.orteils === 'grec' || profile.orteils === 'carre') {
    if (shoe.toebox === 'large') bon.push(5);
    if (shoe.toebox === 'etroit') pen.push(8);
  }

  // ── Calcul final ─────────────────────────────────────────────────
  const totalBonus = bon.reduce((a, b) => a + b, 0);
  const totalPen   = pen.reduce((a, b) => a + b, 0);
  let finalScore = Math.round(Math.min(100, Math.max(0, score + totalBonus - totalPen)));

  return finalScore;
}

/**
 * Génère les alertes en fonction des incompatibilités détectées.
 */
function detectAlerts(profile) {
  const alerts = [];

  const blessures = profile.blessures || [];
  const drop = profile.drop;
  const foulee = profile.foulee;
  const fermete = profile.fermete;
  const poids = parseInt(profile.poids);

  // 1. Achille + faible drop
  if (blessures.includes('achille') && (drop === 'zero' || drop === 'bas')) {
    alerts.push({
      type: 'danger',
      msg: '⚠️ <strong>Attention :</strong> Tu as indiqué un antécédent de tendinite d\'Achille avec une préférence de drop faible. Un drop bas augmente la tension sur le tendon d\'Achille — nous recommandons un drop 8–12mm pour protéger ce tendon.',
    });
  }

  // 2. Pronateur + amorti très souple
  if (foulee === 'pronateur' && fermete === 'souple') {
    alerts.push({
      type: 'warning',
      msg: '⚠️ <strong>Note :</strong> Une chaussure très souple peut amplifier la pronation. Nous t\'avons priorisé des modèles avec stabilité légère.',
    });
  }

  // 3. Poids élevé + drop zéro
  if (poids > 80 && drop === 'zero') {
    alerts.push({
      type: 'warning',
      msg: '⚠️ <strong>Note :</strong> Pour un poids supérieur à 80kg, le drop zéro sans adaptation progressive peut entraîner des contraintes importantes sur les tendons et articulations.',
    });
  }

  // 4. Compétition + débutant (fréquence faible)
  if (profile.objectif === 'competition' && profile.frequence === '1_2') {
    alerts.push({
      type: 'info',
      msg: 'ℹ️ <strong>Info :</strong> Tu vises la compétition mais t\'entraînes 1–2 fois par semaine. La super shoe n\'est peut-être pas la priorité — une chaussure polyvalente de qualité sera plus bénéfique au quotidien.',
    });
  }

  // 5. Fracture de fatigue + compétition à drop bas
  if (blessures.includes('fracture_fatigue') && (drop === 'zero' || drop === 'bas')) {
    alerts.push({
      type: 'danger',
      msg: '⚠️ <strong>Attention :</strong> Suite à une fracture de fatigue, un drop bas et peu d\'amorti augmentent les contraintes osseuses. Nous t\'orientons vers des chaussures très amortissantes.',
    });
  }

  return alerts;
}

/* ================================================================
   4. ÉTAT GLOBAL & NAVIGATION
   ================================================================ */

let currentStep  = 0;           // index 0..17
let userProfile  = {};          // réponses collectées
let compareList  = [];          // max 3 chaussures à comparer

/* Initialise le formulaire depuis la page d'accueil */
function startForm() {
  showPage('page-form');
  currentStep = 0;
  userProfile = {};
  compareList = [];

  // Initialise les valeurs par défaut pour les inputs numériques
  STEPS.forEach(step => {
    if (step.type === 'number' || step.type === 'slider') {
      userProfile[step.key] = step.defaultVal;
    }
  });

  renderStep();
  updateDots();
}

/* Affiche une page et cache les autres */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  window.scrollTo(0, 0);
}

/* Retour à l'accueil */
function goHome() {
  showPage('page-home');
}

/* Recommence le formulaire depuis les résultats */
function restartForm() {
  startForm();
}

/* ── Navigation étapes ─────────────────────────────────────────── */

function nextStep() {
  // Vérifie si une réponse est requise
  const step = STEPS[currentStep];
  if (!hasAnswer(step)) {
    shakeContainer();
    return;
  }

  if (currentStep < STEPS.length - 1) {
    currentStep++;
    renderStep();
    updateProgress();
    updateDots();
    updateNavButtons();
  } else {
    // Dernière étape → génère les résultats
    generateResults();
  }
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    renderStep();
    updateProgress();
    updateDots();
    updateNavButtons();
  }
}

/* Vérifie qu'une réponse a été fournie */
function hasAnswer(step) {
  const val = userProfile[step.key];
  if (step.type === 'multi') {
    return val && val.length > 0;
  }
  if (step.type === 'number' || step.type === 'slider') {
    return val !== undefined && val !== null;
  }
  return val !== undefined && val !== null && val !== '';
}

/* Animation erreur si pas de réponse */
function shakeContainer() {
  const c = document.getElementById('form-container');
  c.style.animation = 'none';
  c.offsetHeight; // reflow
  c.style.animation = 'shake 0.4s ease';
}

/* Mise à jour barre de progression */
function updateProgress() {
  const pct = ((currentStep) / (STEPS.length - 1)) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent = STEP_LABELS[currentStep] || '';
  document.getElementById('step-current').textContent = currentStep + 1;
  document.getElementById('step-total').textContent = STEPS.length;
}

/* Mise à jour des boutons nav */
function updateNavButtons() {
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  btnPrev.disabled = currentStep === 0;
  if (currentStep === STEPS.length - 1) {
    btnNext.textContent = '';
    btnNext.innerHTML = 'Voir mes résultats <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    btnNext.classList.add('cta-final');
  } else {
    btnNext.innerHTML = 'Suivant <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    btnNext.classList.remove('cta-final');
  }
}

/* Mise à jour des points de progression */
function updateDots() {
  const container = document.getElementById('form-dots');
  container.innerHTML = '';
  STEPS.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'form-dot';
    if (i < currentStep) dot.classList.add('done');
    if (i === currentStep) dot.classList.add('current');
    dot.title = STEP_LABELS[i] || '';
    dot.onclick = () => {
      if (i < currentStep) {
        currentStep = i;
        renderStep();
        updateProgress();
        updateDots();
        updateNavButtons();
      }
    };
    container.appendChild(dot);
  });
}

/* ================================================================
   5. RENDU DES QUESTIONS
   ================================================================ */

function renderStep() {
  const step = STEPS[currentStep];
  const container = document.getElementById('form-container');

  // Animation de sortie/entrée
  container.style.opacity = '0';
  container.style.transform = 'translateY(10px)';

  setTimeout(() => {
    container.innerHTML = buildStepHTML(step);
    container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';

    // Attache les événements après le rendu
    bindStepEvents(step);
    updateProgress();
    updateNavButtons();
  }, 150);
}

function buildStepHTML(step) {
  let html = `
    <div class="question-wrap">
      <div class="question-category">${step.category}</div>
      <h2 class="question-title">${step.title}</h2>
      ${step.hint ? `<p class="question-hint">${step.hint}</p>` : ''}
      ${step.tooltip ? `<div class="hint-tooltip">${step.tooltip}</div>` : ''}
  `;

  switch (step.type) {
    case 'options':
      html += buildOptionsHTML(step);
      break;
    case 'multi':
      html += buildMultiHTML(step);
      break;
    case 'number':
      html += buildNumberHTML(step);
      break;
    case 'slider':
      html += buildSliderHTML(step);
      break;
  }

  html += `</div>`;
  return html;
}

/* ── Options (choix unique) ─────────────────────────────────────── */
function buildOptionsHTML(step) {
  const selected = userProfile[step.key];
  const colClass = `cols-${step.cols || 2}`;
  let html = `<div class="options-grid ${colClass}" id="options-${step.id}">`;

  step.options.forEach(opt => {
    const isSelected = selected === opt.value ? 'selected' : '';
    const checkMark = isSelected ? '✓' : '';
    html += `
      <div class="option-card ${isSelected}" data-value="${opt.value}" onclick="selectOption('${step.key}', '${opt.value}', this)">
        <div class="option-icon">${opt.icon}</div>
        <div class="option-body">
          <div class="option-label">${opt.label}</div>
          ${opt.desc ? `<div class="option-desc">${opt.desc}</div>` : ''}
        </div>
        <div class="option-check">${checkMark}</div>
      </div>
    `;
  });

  html += `</div>`;
  return html;
}

/* ── Options multiples (blessures) ─────────────────────────────── */
function buildMultiHTML(step) {
  const selected = userProfile[step.key] || [];
  let html = `<p class="multi-hint">Sélectionne tout ce qui s'applique (choix multiples possibles)</p>`;
  html += `<div class="options-grid cols-2" id="options-${step.id}">`;

  step.options.forEach(opt => {
    const isSelected = selected.includes(opt.value) ? 'selected' : '';
    const checkMark = isSelected ? '✓' : '';
    html += `
      <div class="option-card ${isSelected}" data-value="${opt.value}" onclick="toggleMulti('${step.key}', '${opt.value}', this)">
        <div class="option-icon">${opt.icon}</div>
        <div class="option-body">
          <div class="option-label">${opt.label}</div>
          ${opt.desc ? `<div class="option-desc">${opt.desc}</div>` : ''}
        </div>
        <div class="option-check">${checkMark}</div>
      </div>
    `;
  });

  html += `</div>`;
  return html;
}

/* ── Nombre avec boutons +/- ────────────────────────────────────── */
function buildNumberHTML(step) {
  const val = userProfile[step.key] || step.defaultVal;
  return `
    <div class="number-input-wrap" style="margin-top: 1rem">
      <button class="btn-num" onclick="changeNumber('${step.key}', ${-step.step}, ${step.min}, ${step.max}, '${step.key}-display')">−</button>
      <input
        class="num-display"
        id="${step.key}-display"
        type="number"
        value="${val}"
        min="${step.min}"
        max="${step.max}"
        step="${step.step}"
        oninput="userProfile['${step.key}'] = parseFloat(this.value)"
      />
      <button class="btn-num" onclick="changeNumber('${step.key}', ${step.step}, ${step.min}, ${step.max}, '${step.key}-display')">+</button>
      <span class="num-unit">${step.unit}</span>
    </div>
  `;
}

/* ── Slider budget ───────────────────────────────────────────────── */
function buildSliderHTML(step) {
  const val = userProfile[step.key] || step.defaultVal;
  return `
    <div class="slider-wrap" style="margin-top: 1rem">
      <div class="slider-display" id="${step.key}-display">${val}<small> ${step.unit}</small></div>
      <input
        type="range"
        class="range-input"
        id="${step.key}-slider"
        min="${step.min}"
        max="${step.max}"
        step="${step.step}"
        value="${val}"
        oninput="updateSlider('${step.key}', this.value)"
      />
      <div class="range-labels">
        <span>${step.min}${step.unit}</span>
        <span>${step.max}${step.unit}</span>
      </div>
    </div>
  `;
}

function bindStepEvents(step) {
  // Rien de spécial à binder via JS pour ces types — tout est inline
}

/* ================================================================
   6. HANDLERS D'INTERACTIONS
   ================================================================ */

/* Sélection d'une option unique */
function selectOption(key, value, el) {
  userProfile[key] = value;
  // Désélectionne tout, sélectionne le cliqué
  el.closest('.options-grid').querySelectorAll('.option-card').forEach(card => {
    card.classList.remove('selected');
    card.querySelector('.option-check').textContent = '';
  });
  el.classList.add('selected');
  el.querySelector('.option-check').textContent = '✓';

  // Auto-avance après un court délai (expérience fluide)
  setTimeout(() => {
    if (currentStep < STEPS.length - 1) {
      nextStep();
    }
  }, 280);
}

/* Toggle option multiple (blessures) */
function toggleMulti(key, value, el) {
  if (!userProfile[key]) userProfile[key] = [];

  // Si on sélectionne "aucune", on désélectionne tout le reste
  if (value === 'aucune') {
    userProfile[key] = ['aucune'];
    el.closest('.options-grid').querySelectorAll('.option-card').forEach(card => {
      card.classList.remove('selected');
      card.querySelector('.option-check').textContent = '';
    });
    el.classList.add('selected');
    el.querySelector('.option-check').textContent = '✓';
    return;
  }

  // Si on sélectionne autre chose, déselectionne "aucune"
  const noneCard = el.closest('.options-grid').querySelector('[data-value="aucune"]');
  if (noneCard && noneCard.classList.contains('selected')) {
    noneCard.classList.remove('selected');
    noneCard.querySelector('.option-check').textContent = '';
    userProfile[key] = userProfile[key].filter(v => v !== 'aucune');
  }

  const idx = userProfile[key].indexOf(value);
  if (idx > -1) {
    userProfile[key].splice(idx, 1);
    el.classList.remove('selected');
    el.querySelector('.option-check').textContent = '';
  } else {
    userProfile[key].push(value);
    el.classList.add('selected');
    el.querySelector('.option-check').textContent = '✓';
  }
}

/* Boutons +/- pour les champs numériques */
function changeNumber(key, delta, min, max, displayId) {
  let val = parseFloat(userProfile[key] || 0) + delta;
  val = Math.min(max, Math.max(min, val));
  userProfile[key] = val;
  document.getElementById(displayId).value = val;
}

/* Mise à jour slider budget */
function updateSlider(key, value) {
  userProfile[key] = parseFloat(value);
  const display = document.getElementById(key + '-display');
  if (display) {
    display.innerHTML = value + '<small> €</small>';
  }
}

/* ================================================================
   7. GÉNÉRATION DES RÉSULTATS
   ================================================================ */

function generateResults() {
  showPage('page-results');

  // Normalise certaines valeurs
  if (!userProfile.blessures || userProfile.blessures.length === 0) {
    userProfile.blessures = ['aucune'];
  }

  // Score toutes les chaussures
  const scored = SHOES_DB.map(shoe => ({
    ...shoe,
    compatibilite: scoreShoe(shoe, userProfile),
  }));

  // Trie par score décroissant, garde les 7 meilleures
  scored.sort((a, b) => b.compatibilite - a.compatibilite);
  const top = scored.slice(0, 7);

  // Alertes
  const alerts = detectAlerts(userProfile);
  renderAlerts(alerts);

  // Résumé du profil
  renderProfileSummary();

  // Sous-titre adapté
  const surface = { route: 'route', trail: 'trail', mixte: 'route et trail' }[userProfile.surface] || '';
  document.getElementById('results-subtitle').textContent =
    `${top.length} chaussures recommandées pour ta pratique en ${surface}`;

  // Cartes chaussures
  renderShoeCards(top);
}

/* Affiche les alertes */
function renderAlerts(alerts) {
  const container = document.getElementById('alerts-container');
  container.innerHTML = '';
  alerts.forEach(alert => {
    const div = document.createElement('div');
    div.className = 'alert-box';
    div.innerHTML = `<div class="alert-text">${alert.msg}</div>`;
    container.appendChild(div);
  });
}

/* Affiche le résumé du profil */
function renderProfileSummary() {
  const p = userProfile;
  const container = document.getElementById('profile-summary');

  const surfaceLabel = { route: 'Route', trail: 'Trail', mixte: 'Mixte' }[p.surface] || p.surface;
  const fouleeLabel  = { neutre: 'Foulée neutre', pronateur: 'Pronateur', supinateur: 'Supinateur', je_sais_pas: 'Foulée inconnue' }[p.foulee] || p.foulee;
  const objLabel     = { ef: 'EF / Loisir', seuil: 'Seuil / Tempo', vma: 'VMA', competition: 'Compétition', loisir: 'Loisir' }[p.objectif] || p.objectif;

  const tags = [
    { k: 'Pointure', v: p.pointure + ' EU' },
    { k: 'Poids', v: p.poids + ' kg' },
    { k: 'Âge', v: p.age + ' ans' },
    { k: 'Surface', v: surfaceLabel },
    { k: 'Foulée', v: fouleeLabel },
    { k: 'Budget', v: p.budget + ' €' },
    { k: 'Objectif', v: objLabel },
    { k: 'Drop', v: { zero: '0–3mm', bas: '4–5mm', moyen: '6–8mm', eleve: '10–12mm', pas_de_preference: 'indifférent' }[p.drop] || p.drop },
  ];

  container.innerHTML = tags.map(t =>
    `<div class="profile-tag">${t.k} : <span>${t.v}</span></div>`
  ).join('');
}

/* Affiche les cartes chaussures */
function renderShoeCards(shoes) {
  const grid = document.getElementById('shoes-grid');
  grid.innerHTML = '';

  shoes.forEach((shoe, idx) => {
    const card = document.createElement('div');
    card.className = 'shoe-card' + (idx === 0 ? ' top-pick' : '');
    card.style.animationDelay = (idx * 0.07) + 's';

    const prosHTML = shoe.pros.slice(0, 2).map(p => `✓ ${p}`).join('<br>');
    const consHTML = shoe.cons.slice(0, 1).map(c => `△ ${c}`).join('');

    const tagsHTML = shoe.tags.map(t =>
      `<span class="tech-tag">${t}</span>`
    ).join('');

    card.innerHTML = `
      ${idx === 0 ? '<div class="shoe-card-badge">Meilleur choix</div>' : ''}
      <div class="shoe-card-header">
        <div class="shoe-card-icon">${shoe.icon}</div>
        <div class="shoe-card-title">
          <div class="shoe-brand">${shoe.brand}</div>
          <div class="shoe-model">${shoe.model}</div>
        </div>
        <div class="shoe-score">
          <div class="score-circle">${shoe.compatibilite}</div>
          <div class="score-label">compat.</div>
        </div>
      </div>
      <div class="shoe-card-body">

        <!-- Barres de scores -->
        <div class="shoe-scores">
          ${renderScoreBar('Amorti', shoe.scores.amorti)}
          ${renderScoreBar('Stabilité', shoe.scores.stabilite)}
          ${renderScoreBar('Dynamisme', shoe.scores.dynamisme)}
          ${renderScoreBar('Accroche', shoe.scores.accroche)}
        </div>

        <!-- Tags techniques -->
        <div class="shoe-tech">${tagsHTML}</div>

        <!-- Points forts / faibles -->
        <div class="shoe-pros-cons">
          <div class="pros"><strong>Points forts</strong><br>${prosHTML}</div>
          <div class="cons"><strong>À noter</strong><br>${consHTML}</div>
        </div>

        <!-- Prix + comparer -->
        <div class="shoe-price">
          <div>
            <div class="price-amount">${shoe.price} €</div>
            <div class="price-note">Prix indicatif constaté</div>
          </div>
          <button class="btn-compare" onclick="toggleCompare('${shoe.id}', this)">+ Comparer</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Anime les barres de score après rendu
  setTimeout(() => {
    document.querySelectorAll('.score-bar-fill').forEach(bar => {
      const target = bar.getAttribute('data-width');
      bar.style.width = target + '%';
    });
  }, 200);
}

/* Génère le HTML d'une barre de score */
function renderScoreBar(label, val) {
  const pct = (val / 10) * 100;
  return `
    <div class="score-row">
      <span class="score-name">${label}</span>
      <div class="score-bar-track">
        <div class="score-bar-fill" data-width="${pct}" style="width: 0%"></div>
      </div>
      <span class="score-val">${val}/10</span>
    </div>
  `;
}

/* ================================================================
   8. COMPARATEUR
   ================================================================ */

function toggleCompare(shoeId, btn) {
  const idx = compareList.indexOf(shoeId);
  if (idx > -1) {
    compareList.splice(idx, 1);
    btn.classList.remove('active');
    btn.textContent = '+ Comparer';
  } else {
    if (compareList.length >= 3) {
      alert('Tu peux comparer jusqu\'à 3 chaussures. Retire-en une d\'abord.');
      return;
    }
    compareList.push(shoeId);
    btn.classList.add('active');
    btn.textContent = '✓ Sélectionné';
  }
  updateComparator();
}

function updateComparator() {
  const section = document.getElementById('comparator-section');
  const table   = document.getElementById('comparator-table');

  if (compareList.length < 2) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const shoes = compareList.map(id => SHOES_DB.find(s => s.id === id)).filter(Boolean);
  const cols = shoes.length + 1; // +1 pour la colonne label

  // En-tête
  let html = `<div class="comp-row header-row" style="grid-template-columns: 160px repeat(${shoes.length}, 1fr)">`;
  html += `<div class="comp-cell label">Modèle</div>`;
  shoes.forEach(s => {
    html += `<div class="comp-cell"><strong>${s.brand}</strong><br>${s.model}</div>`;
  });
  html += `</div>`;

  // Lignes critères
  const rows = [
    { label: 'Prix', key: 'price', unit: '€', fmt: v => v + ' €' },
    { label: 'Drop', key: 'drop', unit: 'mm', fmt: v => v + ' mm' },
    { label: 'Poids', key: 'weight', unit: 'g', fmt: v => v + ' g' },
    { label: 'Amorti', key: 'scores.amorti', fmt: v => v + '/10' },
    { label: 'Stabilité', key: 'scores.stabilite', fmt: v => v + '/10' },
    { label: 'Dynamisme', key: 'scores.dynamisme', fmt: v => v + '/10' },
    { label: 'Accroche', key: 'scores.accroche', fmt: v => v + '/10' },
    { label: 'Toe-box', key: 'toebox', fmt: v => ({ large: 'Large', standard: 'Standard', etroit: 'Étroit' }[v] || v) },
    { label: 'Compatibilité', key: 'compatibilite', fmt: v => v + '/100' },
  ];

  rows.forEach(row => {
    const vals = shoes.map(s => {
      const keys = row.key.split('.');
      return keys.reduce((obj, k) => obj ? obj[k] : undefined, s);
    });

    // Détermine le "meilleur" (numérique uniquement)
    let bestIdx = -1;
    const numVals = vals.map(v => parseFloat(v));
    if (!isNaN(numVals[0])) {
      // Pour poids et prix : plus bas = mieux. Pour le reste : plus haut = mieux.
      const invert = ['price', 'weight'].includes(row.key);
      let best = invert ? Infinity : -Infinity;
      numVals.forEach((v, i) => {
        if (invert ? v < best : v > best) { best = v; bestIdx = i; }
      });
    }

    html += `<div class="comp-row" style="grid-template-columns: 160px repeat(${shoes.length}, 1fr)">`;
    html += `<div class="comp-cell label">${row.label}</div>`;
    vals.forEach((v, i) => {
      const better = i === bestIdx ? 'better' : '';
      html += `<div class="comp-cell ${better}">${row.fmt(v)}</div>`;
    });
    html += `</div>`;
  });

  table.innerHTML = html;
}

/* ================================================================
   CSS SHAKE (ajouté dynamiquement)
   ================================================================ */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);
