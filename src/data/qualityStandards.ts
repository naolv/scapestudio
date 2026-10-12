import { QualityStandardCheck, FreeImageSource } from '../types';

export const FREE_IMAGE_SOURCES: FreeImageSource[] = [
  {
    name: 'Pixabay',
    domain: 'pixabay.com',
    url: 'https://pixabay.com',
    bestFor: 'Riesige Auswahl an Fotos, Zeichnungen und Illustrationen zu fast jedem Thema (Tiere, Technik, Natur, Erfindungen).',
  },
  {
    name: 'Unsplash',
    domain: 'unsplash.com',
    url: 'https://unsplash.com',
    bestFor: 'Wunderschöne, hochwertige Fotos (besonders gut für Kunst-, Natur- und Landschaftsthemen).',
  },
  {
    name: 'Wikimedia Commons',
    domain: 'commons.wikimedia.org',
    url: 'https://commons.wikimedia.org',
    bestFor: 'Fotos zu Geschichte, Berühmtheiten, Geografie, Wissenschaft und Tieren.',
  },
  {
    name: 'Klexikon',
    domain: 'klexikon.zum.de',
    url: 'https://klexikon.zum.de',
    bestFor: 'Das Kinder-Wiki! Alle Bilder dort sind für Schularbeiten sicher und frei nutzbar (ideal für Sachunterricht & Doku).',
  },
  {
    name: 'Pexels',
    domain: 'pexels.com',
    url: 'https://pexels.com',
    bestFor: 'Tolle kostenlose Fotos und kurze Videoclips (super für Präsentationen und Videos).',
  },
];

export const QUALITY_STANDARDS: QualityStandardCheck[] = [
  {
    id: 'proofread',
    number: 1,
    label: 'Text und Grammatik Check',
    iconName: 'PenLine',
    shortTag: 'Sprache & Sätze',
    description: 'Du hast deinen Text gründlich durchgelesen oder gemeinsam mit jemandem überprüft: Rechtschreibung, Grammatik und Sätze stimmen zum grössten Teil.',
    questions: [
      'Lies deinen Text einmal laut vor: Stolperst du an einer Stelle oder geht dir die Puste aus?',
      'Lass eine andere Person (Mitschüler/in oder Lehrperson) kurz drüberschauen.',
      'Stimmen Rechtschreibung und Satzzeichen zum grössten Teil (Satzanfänge gross, Punkte und Kommas)?',
    ],
    tips: [
      'Wenn ein Satz sehr lang ist: Teile ihn einfach mit einem Punkt in zwei kürzere, knackige Sätze.',
      'Lies deinen Text rückwärts Wort für Wort durch – so fallen Rechtschreibfehler viel schneller auf!',
      'Schlage Wörter, bei denen du unsicher bist, im Duden oder im Klassenlexikon nach.',
    ],
    kidTip: 'Tipp: Laut vorlesen hilft wie Zauberei! Wenn du beim Vorlesen stockst, braucht der Satz meistens ein Komma oder einen Punkt.',
  },
  {
    id: 'structure',
    number: 2,
    label: 'Der Rote Faden',
    iconName: 'GitBranch',
    shortTag: 'Aufbau & Logik',
    description: 'Dein Werk hat einen klaren Aufbau: von einem gelungenen Anfang über den Hauptteil bis zum passenden Abschluss.',
    questions: [
      'Hat dein Werk einen klaren Anfang (Einleitung/Thema), einen Hauptteil (Erklärung/Geschichte) und einen Schluss (Fazit/Ergebnis)?',
      'Versteht jemand dein Thema, der vorher noch nie davon gehört hat?',
      'Gibt es Absätze und Zwischenüberschriften, damit der Text übersichtlich bleibt?',
    ],
    tips: [
      'Einleitung: Verrate kurz, worum es geht und warum dich das Thema interessiert.',
      'Hauptteil: Erkläre die wichtigsten Schritte, Erlebnisse oder Fakten nacheinander.',
      'Schluss: Was hast du gelernt? Was war dein Highlight oder dein Fazit?',
    ],
    kidTip: 'Tipp: Stell dir vor, du erzählst das Projekt deiner Grossmutter oder jemandem aus der 1. Klasse. Kommen sie problemlos mit?',
  },
  {
    id: 'cover',
    number: 3,
    label: 'Aussagekräftiges Cover',
    iconName: 'Palette',
    shortTag: 'Titel & Optik',
    description: 'Dein Titel und dein Titelbild passen genau zu deinem Thema und machen neugierig auf dein Projekt.',
    questions: [
      'Hat dein Projekt einen coolen, passenden Titel, der sofort ins Auge springt?',
      'Passt dein Titelbild genau zum Thema und macht Lust aufs Lesen, Anschauen oder Spielen?',
      'Ist die Schrift auf dem Bild gut lesbar (nicht zu hell auf hellem Grund)?',
    ],
    tips: [
      'Wähle ein klares Motiv statt vieler kleiner, unruhiger Schnipsel.',
      'Ein starker Titel ist kurz und neugierig machend (z.B. «Geheimnis der Bänderschnecke» statt nur «Schnecke»).',
      'Schau dir dein Cover von weitem an: Erkennt man das Thema auf den ersten Blick?',
    ],
    kidTip: 'Tipp: Das Cover ist wie das Schaufenster einer Bäckerei – es soll sofort Lust machen, hineinzuschauen!',
  },
  {
    id: 'media_quality',
    number: 4,
    label: 'Medienqualität',
    iconName: 'Video',
    shortTag: 'Audio, Video & Fotos',
    description: 'Deine Tonaufnahmen sind gut verständlich, Videos wackelfrei und deine Zeichnungen oder Fotos sauber eingefügt.',
    questions: [
      'Bei Videos & Audio: Ist deine Stimme gut zu hören? Ist die Musik nicht zu laut?',
      'Wackelt die Kamera nicht zu stark (iPad mit beiden Händen halten oder aufstellen)?',
      'Bei Text & Fotos: Sind eingefügte Fotos scharf und gut erkennbar (nicht verzerrt oder unscharf)?',
    ],
    tips: [
      'Tonaufnahmen: Nimm in einer ruhigen Ecke auf und halte das Mikrofon etwa eine Handbreite vor den Mund.',
      'Fotos & Scans: Achte auf gutes Licht (am besten Tageslicht am Fenster ohne Schatten deiner Hand).',
      'Bilder beim Vergrössern immer an der Ecke ziehen, damit die Figuren nicht gequetscht werden.',
    ],
    kidTip: 'Tipp: Schliesse beim Audio-Test kurz die Augen und höre nur hin: Verstehst du jedes einzelne Wort mühelos?',
  },
  {
    id: 'copyright',
    number: 5,
    label: 'Urheberrecht & Bilder',
    iconName: 'Camera',
    shortTag: 'Rechte & Freie Bilder',
    description: 'Bilder, Grafiken und Musik hast du selbst gemacht oder nutzt kinderfreundliche, lizenzfreie Plattformen mit Quellennachweis.',
    questions: [
      'Hast du Fotos/Grafiken verwendet, die du selbst gemacht oder gezeichnet hast? Super, das ist am allerbesten!',
      'Wenn du Bilder aus dem Internet nutzt: Stammen sie von einer freien Plattform (siehe Liste unten)?',
      'Hast du unter das Bild oder am Ende geschrieben, woher das Bild stammt?',
    ],
    tips: [
      'Wichtig: Niemals einfach Bilder aus der normalen Google-Bildersuche kopieren (die gehören meistens anderen Personen).',
      'Nutze kostenlose, kinderfreundliche Bilddatenbanken wie Klexikon, Pixabay, Unsplash oder Pexels.',
      'Gib immer die Bildquelle an – so bist du rechtlich auf der sicheren Seite!',
    ],
    kidTip: 'Tipp: Am besten sind deine eigenen Fotos und Zeichnungen! Wenn du fremde Bilder nimmst, nenne immer den Schöpfer oder die Plattform.',
    hasFreeImagesTable: true,
    citationGuide: {
      example: 'Bildquelle: Pixabay oder Bild von: Klexikon',
      explanation: 'Schreib unter das Bild oder ans Ende deines Werks einfach den Namen der Plattform oder den Fotografen.',
    },
  },
  {
    id: 'sources',
    number: 6,
    label: 'Quellen & KI-Ehrlichkeit',
    iconName: 'BookMarked',
    shortTag: 'Quellenverzeichnis & KI',
    description: 'Alle Bücher, Webseiten und KI-Recherchehilfen hast du am Ende ehrlich aufgeschrieben und Fakten überprüft.',
    questions: [
      'Bücher: Hast du Titel und Autor aufgeschrieben (z.B. «WAS IST WAS: Planeten»)?',
      'Webseiten: Hast du den Namen der Seite und die Adresse notiert (z.B. «Klexikon – klexikon.zum.de»)?',
      'KI-Hilfe (ChatGPT, Google KI): Wenn du KI für die Suche oder Ideen genutzt hast, schreibst du es einfach ehrlich dazu?',
      'Fakten-Check: Hast du KI-Antworten mit einer zweiten Quelle (Buch oder Webseite) überprüft?',
    ],
    tips: [
      'Bücher notieren: «Buch: [Titel] von [Autor/in]»',
      'Webseiten notieren: «Webseite: [Name] – [Link]»',
      'KI-Vermerk: «Recherche-Hilfe: Google KI / ChatGPT für Ideensammlung»',
      'KI weiss nicht alles: Manchmal erfindet KI Dinge. Glaube ihr nie blind ohne Nachschlagen!',
    ],
    kidTip: 'Tipp: Quellen aufzuschreiben ist keine lästige Pflicht, sondern das Zeichen eines echten Forschers! Es zeigt, wie gründlich du gearbeitet hast.',
    citationGuide: {
      example: 'Quellen: Buch «WAS IST WAS: Bienen» | Klexikon: klexikon.zum.de | Recherche-Hilfe: ChatGPT für Stichworte',
      explanation: 'Ein kurzes Quellenverzeichnis ganz am Ende deines Projekts reicht völlig aus!',
    },
  },
];

// Inspiration words used internally by the random generator
export const INSPIRATION_WORDS = [
  'Sternfuchs',
  'Waldkauz',
  'Zauberdrache',
  'Polarbaer',
  'Kosmosigel',
  'Flugotter',
  'Robodachs',
  'Buchhase',
  'Tiefseewal',
  'Forschungsloewe',
  'Quantenmeise',
  'Sonnenbussard',
];

export const generateAnonymousAuthorId = (): string => {
  const word = INSPIRATION_WORDS[Math.floor(Math.random() * INSPIRATION_WORDS.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${word}-${num}`;
};

export const isValidAuthorIdPattern = (id: string): boolean => {
  // Pattern: [Wort]-[Zahl], e.g. "Sternfuchs-42"
  return /^[a-zA-ZäöüÄÖÜß]{3,15}-\d{1,4}$/.test(id.trim());
};
