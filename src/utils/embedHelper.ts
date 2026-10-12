export interface EmbedDetails {
  isGame: boolean;
  isScratch: boolean;
  isLichess: boolean;
  isEmbeddable: boolean;
  embedUrl: string | null;
  turboWarpUrl: string | null;
  scratchOfficialUrl?: string | null;
  scratchProjectId?: string;
  lichessId?: string;
  cleanProjectUrl?: string;
  gameType?: 'scratch' | 'turbowarp' | 'lichess' | 'learningapps' | 'bookcreator' | 'youtube' | 'webgame' | 'general';
  suggestedTitle?: string;
  suggestedCover?: string;
  launcherLabel: string;
}

/**
 * Extracts a valid HTTP/HTTPS URL from user input, even if they pasted an HTML <iframe ...> embed snippet.
 */
export function extractCleanUrl(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  // Check if user pasted an <iframe> tag (e.g. <iframe src="https://scratch.mit.edu/projects/123456789/embed" ...>)
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch) {
    return iframeMatch[1].trim();
  }
  return trimmed;
}

/**
 * Detects project type and constructs clean, iframe-compatible embed URLs.
 * Handles Scratch, TurboWarp, Lichess (Schach), LearningApps, Book Creator, YouTube, etc.
 */
export function detectEmbedDetails(
  url?: string | null,
  creationTool?: string | null,
  rubrikId?: string | null
): EmbedDetails {
  const isGameByMeta =
    rubrikId === 'games' ||
    creationTool === 'Scratch & Interaktiv' ||
    (typeof url === 'string' &&
      (url.toLowerCase().includes('schach') ||
        url.toLowerCase().includes('chess') ||
        url.toLowerCase().includes('scratch') ||
        url.toLowerCase().includes('turbowarp') ||
        url.toLowerCase().includes('game') ||
        url.toLowerCase().includes('spiel')));

  const cleanUrl = extractCleanUrl(url);

  if (!cleanUrl || !cleanUrl.startsWith('http')) {
    return {
      isGame: !!isGameByMeta,
      isScratch: false,
      isLichess: false,
      isEmbeddable: false,
      embedUrl: null,
      turboWarpUrl: null,
      cleanProjectUrl: cleanUrl,
      launcherLabel: 'Im Browser öffnen',
    };
  }

  const trimmed = cleanUrl;

  // 1. Scratch Project (scratch.mit.edu/projects/123456789)
  const scratchMatch = trimmed.match(/scratch\.mit\.edu\/projects\/(\d+)/i);
  if (scratchMatch) {
    const pId = scratchMatch[1];
    return {
      isGame: true,
      isScratch: true,
      isLichess: false,
      isEmbeddable: true,
      scratchProjectId: pId,
      // TurboWarp supports WebAudio immediately and runs 60fps smoothly with full audio
      embedUrl: `https://turbowarp.org/${pId}/embed?autoplay=true`,
      turboWarpUrl: `https://turbowarp.org/${pId}/embed?autoplay=true`,
      scratchOfficialUrl: `https://scratch.mit.edu/projects/${pId}/embed`,
      cleanProjectUrl: `https://scratch.mit.edu/projects/${pId}`,
      gameType: 'scratch',
      suggestedTitle: 'Scratch Spiel',
      suggestedCover: `https://uploads.scratch.mit.edu/get_image/project/${pId}_480x360.png`,
      launcherLabel: 'In TurboWarp Vollbild öffnen',
    };
  }

  // 2. TurboWarp (turbowarp.org/123456789)
  const turboMatch = trimmed.match(/turbowarp\.org\/(?:embed\/)?(\d+)/i);
  if (turboMatch) {
    const pId = turboMatch[1];
    return {
      isGame: true,
      isScratch: true,
      isLichess: false,
      isEmbeddable: true,
      scratchProjectId: pId,
      embedUrl: `https://turbowarp.org/${pId}/embed?autoplay=true`,
      turboWarpUrl: `https://turbowarp.org/${pId}/embed?autoplay=true`,
      scratchOfficialUrl: `https://scratch.mit.edu/projects/${pId}/embed`,
      cleanProjectUrl: `https://scratch.mit.edu/projects/${pId}`,
      gameType: 'turbowarp',
      suggestedTitle: 'TurboWarp Spiel',
      suggestedCover: `https://uploads.scratch.mit.edu/get_image/project/${pId}_480x360.png`,
      launcherLabel: 'In TurboWarp Vollbild spielen',
    };
  }

  // 3. Lichess (Schach / Chess)
  const lichessMatch = trimmed.match(/lichess\.org\/(?:embed\/game\/|study\/)?([a-zA-Z0-9]{8,12})/i);
  if (lichessMatch) {
    const gId = lichessMatch[1];
    return {
      isGame: true,
      isScratch: false,
      isLichess: true,
      isEmbeddable: true,
      lichessId: gId,
      embedUrl: `https://lichess.org/embed/game/${gId}?theme=auto`,
      turboWarpUrl: null,
      cleanProjectUrl: `https://lichess.org/${gId}`,
      gameType: 'lichess',
      suggestedTitle: 'Interaktive Schachpartie (Lichess)',
      launcherLabel: 'Schachpartie im Vollbild öffnen',
    };
  }

  // 4. LearningApps (frequent in Swiss schools for chess puzzles and quizzes)
  const learningMatch = trimmed.match(/learningapps\.org\/(?:watch\?v=|watch\.php\?v=|view\/)?([a-zA-Z0-9_]+)/i);
  if (learningMatch) {
    const appId = learningMatch[1];
    return {
      isGame: true,
      isScratch: false,
      isLichess: false,
      isEmbeddable: true,
      embedUrl: `https://learningapps.org/watch.php?v=${appId}`,
      turboWarpUrl: null,
      cleanProjectUrl: `https://learningapps.org/watch.php?v=${appId}`,
      gameType: 'learningapps',
      suggestedTitle: 'LearningApp Übung / Spiel',
      launcherLabel: 'LearningApp im Vollbild öffnen',
    };
  }

  // 5. Book Creator Reader
  if (trimmed.includes('bookcreator.com')) {
    return {
      isGame: false,
      isScratch: false,
      isLichess: false,
      isEmbeddable: true,
      embedUrl: trimmed,
      turboWarpUrl: null,
      cleanProjectUrl: trimmed,
      gameType: 'bookcreator',
      launcherLabel: 'Im Book Creator Vollbild öffnen',
    };
  }

  // 6. YouTube
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch) {
    const vId = ytMatch[1];
    return {
      isGame: false,
      isScratch: false,
      isLichess: false,
      isEmbeddable: true,
      embedUrl: `https://www.youtube-nocookie.com/embed/${vId}?rel=0`,
      turboWarpUrl: null,
      cleanProjectUrl: `https://www.youtube.com/watch?v=${vId}`,
      gameType: 'youtube',
      launcherLabel: 'Auf YouTube öffnen',
    };
  }

  // 7. General Interactive / Web Game / Schach link
  return {
    isGame: isGameByMeta,
    isScratch: false,
    isLichess: false,
    isEmbeddable: true,
    embedUrl: trimmed,
    turboWarpUrl: null,
    cleanProjectUrl: trimmed,
    gameType: isGameByMeta ? 'webgame' : 'general',
    launcherLabel: isGameByMeta ? 'Spiel in eigenem Tab / Vollbild öffnen' : 'Projekt im Vollbild öffnen',
  };
}
