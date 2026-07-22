// src/util/resolveTeamLogo.ts

interface TeamLogoDefinition {
  aliases: readonly string[]
  path: string
}

const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ')

const teamLogos: readonly TeamLogoDefinition[] = [
  { aliases: ['Arizona Cardinals', 'Cardinals', 'ARI'], path: '/logos/nfc/Cardinals.avif' },
  { aliases: ['Atlanta Falcons', 'Falcons', 'ATL'], path: '/logos/nfc/Falcons.avif' },
  { aliases: ['Baltimore Ravens', 'Ravens', 'BAL'], path: '/logos/afc/Ravens.avif' },
  { aliases: ['Buffalo Bills', 'Bills', 'BUF'], path: '/logos/afc/Bills.avif' },
  { aliases: ['Carolina Panthers', 'Panthers', 'CAR'], path: '/logos/nfc/Panthers.avif' },
  { aliases: ['Chicago Bears', 'Bears', 'CHI'], path: '/logos/nfc/Bears.avif' },
  { aliases: ['Cincinnati Bengals', 'Bengals', 'CIN'], path: '/logos/afc/Bengals.avif' },
  { aliases: ['Cleveland Browns', 'Browns', 'CLE'], path: '/logos/afc/Browns.avif' },
  { aliases: ['Dallas Cowboys', 'Cowboys', 'DAL'], path: '/logos/nfc/Cowboys.avif' },
  { aliases: ['Denver Broncos', 'Broncos', 'DEN'], path: '/logos/afc/Broncos.avif' },
  { aliases: ['Detroit Lions', 'Lions', 'DET'], path: '/logos/nfc/Lions.avif' },
  { aliases: ['Green Bay Packers', 'Packers', 'GB'], path: '/logos/nfc/Packers.avif' },
  { aliases: ['Houston Texans', 'Texans', 'HOU'], path: '/logos/afc/Texans.avif' },
  { aliases: ['Indianapolis Colts', 'Colts', 'IND'], path: '/logos/afc/Colts.avif' },
  { aliases: ['Jacksonville Jaguars', 'Jaguars', 'JAX'], path: '/logos/afc/Jaguars.avif' },
  { aliases: ['Kansas City Chiefs', 'Chiefs', 'KC'], path: '/logos/afc/Chiefs.avif' },
  { aliases: ['Las Vegas Raiders', 'Oakland Raiders', 'Raiders', 'LV', 'OAK'], path: '/logos/afc/Raiders.avif' },
  { aliases: ['Los Angeles Chargers', 'San Diego Chargers', 'Chargers', 'LAC', 'SD'], path: '/logos/afc/Chargers.webp' },
  { aliases: ['Los Angeles Rams', 'St. Louis Rams', 'Rams', 'LAR', 'STL'], path: '/logos/nfc/Rams.avif' },
  { aliases: ['Miami Dolphins', 'Dolphins', 'MIA'], path: '/logos/afc/Dolphins.avif' },
  { aliases: ['Minnesota Vikings', 'Vikings', 'MIN'], path: '/logos/nfc/Vikings.avif' },
  { aliases: ['New England Patriots', 'Patriots', 'NE'], path: '/logos/afc/Patriots.avif' },
  { aliases: ['New Orleans Saints', 'Saints', 'NO'], path: '/logos/nfc/Saints.avif' },
  { aliases: ['New York Giants', 'Giants', 'NYG'], path: '/logos/nfc/Giants.avif' },
  { aliases: ['New York Jets', 'Jets', 'NYJ'], path: '/logos/afc/Jets.avif' },
  { aliases: ['Philadelphia Eagles', 'Eagles', 'PHI'], path: '/logos/nfc/Eagles.avif' },
  { aliases: ['Pittsburgh Steelers', 'Steelers', 'PIT'], path: '/logos/afc/Steelers.avif' },
  { aliases: ['San Francisco 49ers', '49ers', 'SF'], path: '/logos/nfc/49ers.avif' },
  { aliases: ['Seattle Seahawks', 'Seahawks', 'SEA'], path: '/logos/nfc/Seahawks.avif' },
  { aliases: ['Tampa Bay Buccaneers', 'Buccaneers', 'Bucs', 'TB'], path: '/logos/nfc/Buccaneers.avif' },
  { aliases: ['Tennessee Titans', 'Titans', 'TEN'], path: '/logos/afc/Titans.avif' },
  { aliases: ['Washington Commanders', 'Washington Football Team', 'Washington Redskins', 'Commanders', 'WAS'], path: '/logos/nfc/Commanders.avif' },
]

export function resolveTeamLogo(...teamIdentifiers: Array<string | null | undefined>): string {
  const identifiers = teamIdentifiers
    .filter((value): value is string => Boolean(value?.trim()))
    .map(normalize)

  for (const definition of teamLogos) {
    const aliases = definition.aliases.map(normalize)
    const matched = identifiers.some((identifier) =>
      aliases.some((alias) => identifier === alias || identifier.endsWith(` ${alias}`)),
    )

    if (matched) return definition.path
  }

  return '/logos/logoNfl.jpeg'
}
