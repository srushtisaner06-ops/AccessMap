import { PLACE_BY_ID } from './mockData.js';
import { FEATURE_BY_ID } from './features.js';

export const MAX_DESC = 500;

/** Returns an object of field -> message. Empty object means valid. */
export function validateReportInput(input, now = Date.now()) {
  const errors = {};
  const place = PLACE_BY_ID[input.placeId];
  if (!input.placeId) errors.placeId = 'Choose a place.';
  else if (!place) errors.placeId = 'That place does not exist.';

  if (!input.featureId) errors.featureId = 'Choose an accessibility feature.';
  else if (!FEATURE_BY_ID[input.featureId]) errors.featureId = 'Unknown feature.';
  else if (place && !place.features.includes(input.featureId)) errors.featureId = 'This feature is not tracked for the chosen place.';

  if (!['accessible', 'not_accessible', 'unable'].includes(input.status)) errors.status = 'Select what you observed.';

  const visited = typeof input.visitedAt === 'number' ? input.visitedAt : new Date(input.visitedAt).getTime();
  if (!input.visitedAt || !Number.isFinite(visited)) errors.visitedAt = 'Enter the date and time of your visit.';
  else if (visited > now + 5 * 60000) errors.visitedAt = 'The visit time cannot be in the future.';
  else if (visited < now - 730 * 86400000) errors.visitedAt = 'Visits older than two years cannot be reported.';

  if (input.description && input.description.length > MAX_DESC) errors.description = `Keep the description under ${MAX_DESC} characters.`;
  if (input.photoError) errors.photo = input.photoError;
  if (!input.confirmed) errors.confirmed = 'Please confirm that this report reflects your own observations.';
  return errors;
}
