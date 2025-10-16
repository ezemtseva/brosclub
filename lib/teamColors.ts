export const teamColors = {
    red: ['Liverpool', 'Real Betis', 'AS Roma', 'RB Leipzig', 'Arsenal', 'Atletico Madrid', 'Borussia Dortmund', 'Marseille', 'Sporting CP', 'Bayer Leverkusen'],
    blue: ['Villarreal', 'Chelsea', 'SS Lazio', 'PSG', 'Barcelona', 'Inter', 'Milan', 'Manchester United', 'Galatasaray', 'Wolfsburg'],
    green: ['Juventus', 'Tottenham', 'Newcastle', 'Napoli', 'Athletic Bilbao', 'Aston Villa', 'Real Madrid', 'Bayern Munich', 'Manchester City', 'Nottingham Forrest']
  }
  
  export const getTeamColor = (team: string) => {
    if (teamColors.red.includes(team)) return '#ea7878'
    if (teamColors.blue.includes(team)) return '#4b98de'
    if (teamColors.green.includes(team)) return '#4fcb90'
    return 'transparent'
  }