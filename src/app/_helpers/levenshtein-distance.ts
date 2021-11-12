export const levenshteinDistance = function(str1: string, str2: string) {
  let r: any, c: any, cost: any,
      d = [];
 
  for (r=0; r<=str1.length; r++) {
    d[r] = [r];
  }
  for (c=0; c<=str2.length; c++) {
    d[0][c] = c;
  }
  for (r=1; r<=str1.length; r++) {
    for (c=1; c<=str2.length; c++) {
      cost = str1.charCodeAt(r-1) == str2.charCodeAt(c-1) ? 0: 1;
      d[r][c] = Math.min(d[r-1][c]+1, d[r][c-1]+1, d[r-1][c-1]+cost);
    }
  }
  return d[str1.length][str2.length];
}