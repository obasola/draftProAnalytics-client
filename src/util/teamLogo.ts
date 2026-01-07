// src/util/teamLogos.ts
export interface TeamRef {
  name: string
  conference: string // "AFC" | "NFC" (case-insensitive)
}

export interface TeamLogoInfo {
  shortName: string
  logoUrl: string
}

/**
 * Extracts the "short name" from a full team name.
 * "Cincinnati Bengals" -> "Bengals"
 */
export function getTeamShortName(teamName: string): string {
  const parts = teamName.trim().split(/\s+/)
  return parts[parts.length - 1]
}

/**
 * Decide file extension per team. Adjust as needed.
 */
export function getTeamLogoExt(shortName: string): 'avif' | 'webp' {
  // Your special case for Chargers
  if (shortName === 'Chargers') return 'webp'
  return 'avif'
}

/**
 * Main reusable helper: given a team object, return shortName + logoUrl.
 * Expects logos under /public/logos/{afc|nfc}/{ShortName}.{avif|webp}
 */
export function getTeamLogoInfo(team: TeamRef | null | undefined): TeamLogoInfo {
   // alert("getTeamLogoInfo - entrypoint");
  if (!team || !team.name || !team.conference) {
    //alert("getTeamLogoInfo - UNKNOWN");
    return { shortName: 'Unknown', logoUrl: '' }
  }

  const shortName = getTeamShortName(team.name)
  const ext = getTeamLogoExt(shortName)
  const conferenceDir = team.conference.toLowerCase() // "afc" | "nfc"

  // If you ever set a non-root base in Vite, you can prefix with import.meta.env.BASE_URL
  const logoUrl = `/logos/${conferenceDir}/${shortName}.${ext}`

  return { shortName, logoUrl }
}
