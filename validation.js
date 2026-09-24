function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateStudent(data, partial = false) {
  const errors = [];
  const name = cleanText(data.name);
  const group = cleanText(data.group);

  if (!partial || data.name !== undefined) {
    if (!name) errors.push('name is required');
  }

  if (!partial || data.group !== undefined) {
    if (!group) errors.push('group is required');
  }

  if (!partial || data.course !== undefined) {
    if (!Number.isInteger(data.course) || data.course < 1 || data.course > 4) {
      errors.push('course must be an integer from 1 to 4');
    }
  }

  return {
    errors,
    value: {
      ...(data.name !== undefined ? { name } : {}),
      ...(data.group !== undefined ? { group } : {}),
      ...(data.course !== undefined ? { course: data.course } : {})
    }
  };
}

function validateUser(data) {
  const name = cleanText(data.name);
  const group = cleanText(data.group);
  const errors = [];

  if (!name) errors.push('name is required');
  if (!group) errors.push('group is required');

  return { errors, value: { name, group } };
}

module.exports = {
  validateStudent,
  validateUser
};
