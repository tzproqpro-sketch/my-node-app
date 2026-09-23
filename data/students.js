const { firstNames, lastNames, groups } = require('../config');

function createStudents(count = 50) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `${firstNames[index % firstNames.length]} ${lastNames[(index + Math.floor(index / firstNames.length)) % lastNames.length]}`,
    group: groups[index % groups.length],
    course: (index % 4) + 1
  }));
}

const students = createStudents();

function nextId(items) {
  return items.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;
}

module.exports = {
  createStudents,
  students,
  nextId
};
