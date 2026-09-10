const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchProblems() {
  const response = await fetch(`${API_BASE_URL}/problems`);
  if (!response.ok) throw new Error('Failed to fetch problems');
  return response.json();
}

export async function fetchProblemBySlug(slug) {
  const response = await fetch(`${API_BASE_URL}/problems/${slug}`);
  if (!response.ok) throw new Error('Failed to fetch problem');
  return response.json();
}

export async function submitSolution(data) {
  const response = await fetch(`${API_BASE_URL}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to submit solution');
  return response.json();
}

export async function fetchSubmission(id) {
  const response = await fetch(`${API_BASE_URL}/submissions/${id}`);
  if (!response.ok) throw new Error('Failed to fetch submission details');
  return response.json();
}

export async function fetchProblemHistory(problemId) {
  const response = await fetch(`${API_BASE_URL}/problems/${problemId}/history`);
  if (!response.ok) throw new Error('Failed to fetch problem history');
  return response.json();
}

export async function retrySubmission(id) {
  const response = await fetch(`${API_BASE_URL}/submissions/${id}/retry`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to retry submission');
  return response.json();
}
