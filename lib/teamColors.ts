export const teamColors = {
    red: ['Liverpool', 'Bayern Munich', 'Inter', 'Bayer Leverkusen', 'Newcastle', 'AS Roma', 'Galatasaray', 'Sporting CP', 'SS Lazio', 'AS Monaco'],
    blue: ['Chelsea', 'Manchester City', 'Barcelona', 'Tottenham', 'Milan', 'Aston Villa', 'Athletic Bilbao', 'Manchester United', 'Benfica', 'Olympique Lyonnais'],
    green: ['Juventus', 'Real Madrid', 'Arsenal', 'Borussia Dortmund', 'PSG', 'Atletico Madrid', 'Napoli', 'RB Leipzig', 'Fenerbahçe', 'Al Hilal']
  }
  
  export const getTeamColor = (team: string) => {
    if (teamColors.red.includes(team)) return '#ea7878'
    if (teamColors.blue.includes(team)) return '#4b98de'
    if (teamColors.green.includes(team)) return '#4fcb90'
    return 'transparent'
  }