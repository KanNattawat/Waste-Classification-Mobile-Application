import { WASTE_LABELS } from '../constants/waste';

export const calculateTotal = (arr: number[]) => 
  arr.reduce((sum, i) => sum + i, 0);

export const mapAndSortVotes = (votes: number[]) => {
  const total = calculateTotal(votes);
  
  const mapped = WASTE_LABELS.map((label, i) => {
    const voteNumber = votes[i];
    const percent = total > 0 ? ((voteNumber / total) * 100).toFixed(2) : "0";
    return [label, voteNumber, parseFloat(percent)] as [string, number, number];
  });

  return mapped.sort((a, b) => b[1] - a[1]);
};

export const mapAndSortProbs = (probs: number[]) => {
  const mapped = WASTE_LABELS.map((label, i) => [label, probs[i]] as [string, number]);
  return mapped.sort((a, b) => b[1] - a[1]);
};