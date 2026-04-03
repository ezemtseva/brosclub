export const PLAYER_COLORS: Record<string, string> = {
  Vanilla: "#FA5053",
  Choco:   "#007FFF",
  Panda:   "#00E893",
}

export const teamColors = {
    red: ['Liverpool', 'Atalanta', 'AS Roma', 'Eintracht Frankfurt', 'Arsenal', 'Atletico Madrid', 'Borussia Dortmund', 'Marseille', 'Sporting CP', 'Bayer Leverkusen'],
    blue: ['Villarreal', 'Chelsea', 'SS Lazio', 'PSG', 'Barcelona', 'Inter', 'Milan', 'Manchester United', 'Galatasaray', 'Wolfsburg'],
    green: ['Juventus', 'Tottenham', 'Newcastle', 'Napoli', 'Athletic Bilbao', 'Aston Villa', 'Real Madrid', 'Bayern Munich', 'Manchester City', 'Nottingham Forest']
  }

export const TEAM_ABBR: Record<string, string> = {
  Chelsea:              'CHL',
  PSG:                  'PSG',
  Barcelona:            'BAR',
  Inter:                'INT',
  Milan:                'MIL',
  Galatasaray:          'GAL',
  'SS Lazio':           'LAZ',
  'Manchester United':  'MUN',
  Villarreal:           'VIL',
  Wolfsburg:            'WOL',
  Juventus:             'JUV',
  'Real Madrid':        'RMA',
  'Bayern Munich':      'BMU',
  'Aston Villa':        'AST',
  'Manchester City':    'MCI',
  'Athletic Bilbao':    'ATB',
  Napoli:               'NAP',
  Newcastle:            'NEW',
  'Nottingham Forest': 'NFO',
  Tottenham:            'TOT',
  Liverpool:            'LIV',
  Arsenal:              'ARS',
  'Atletico Madrid':    'ATM',
  'Borussia Dortmund':  'BOR',
  Marseille:            'MAR',
  'AS Roma':            'ROM',
  'Bayer Leverkusen':   'B04',
  'Sporting CP':        'SPO',
  Atalanta:             'ATA',
  'Eintracht Frankfurt':'EIN',
}
  
  export const getTeamColor = (team: string) => {
    if (teamColors.red.includes(team)) return '#ea7878'
    if (teamColors.blue.includes(team)) return '#4b98de'
    if (teamColors.green.includes(team)) return '#4fcb90'
    return 'transparent'
  }