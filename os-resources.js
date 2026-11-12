const os = require('node:os');
function memoryStatus(free, total) { return free / total < 0.2 ? 'WARNING: less than 20% memory is free' : 'Memory is OK'; }
if (require.main === module) {
  const cpus = os.cpus();
  const gb = value => (value / 1024 ** 3).toFixed(2);
  const free = os.freemem();
  const total = os.totalmem();
  console.log('Group: 477');
  console.log('Logical cores:', cpus.length);
  console.log('CPU model:', cpus[0]?.model || 'Unavailable');
  cpus.forEach((cpu, index) => console.log('Core ' + index + ': ' + cpu.speed + ' MHz'));
  console.log('Average speed:', cpus.length ? cpus.reduce((sum, cpu) => sum + cpu.speed, 0) / cpus.length : 0, 'MHz');
  console.log('Total:', gb(total), 'GB; Free:', gb(free), 'GB; Used:', gb(total - free), 'GB');
  console.log('Memory used:', ((1 - free / total) * 100).toFixed(1) + '%');
  console.log('Load average (1/5/15 minutes):', os.platform() === 'win32' ? 'Unavailable on Windows' : os.loadavg());
  console.log(memoryStatus(free, total));
}
module.exports = { memoryStatus };
