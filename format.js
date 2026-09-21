function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${bytes} B`;
}

function formatLine(char = '-', length = 48) {
  return char.repeat(length);
}

module.exports = {
  formatBytes,
  formatLine
};
