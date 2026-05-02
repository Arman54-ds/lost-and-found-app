function calculateMatchScore(lost, found) {
  let score = 0;

  // 1) Category match
  if (lost.category === found.category) score += 40;

  // 2) Keyword match
  const lostWords = lost.keywords || [];
  const foundWords = found.keywords || [];

  const common = lostWords.filter(word => foundWords.includes(word)).length;
  score += common * 10; // 10 points per matched keyword

  // 3) Location match (exact match gives 30)
  if (lost.location && found.location && lost.location.toLowerCase() === found.location.toLowerCase()) {
    score += 30;
  }

  // 4) Date difference (within 5 days → +20)
  if (lost.dateLost && found.dateFound) {
    const diffDays = Math.abs(new Date(found.dateFound) - new Date(lost.dateLost)) / (1000 * 3600 * 24);
    if (diffDays <= 5) score += 20;
  }

  return score;
}

module.exports = calculateMatchScore;
