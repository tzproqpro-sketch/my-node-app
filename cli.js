#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('node:fs/promises');
const inquirer = require('inquirer').default;
const PDFDocument = require('pdfkit');
const { createWriteStream } = require('node:fs');
const { finished } = require('node:stream/promises');
const program = new Command();
program.name('my-cli').description('Laboratory Work 17').version('1.0.0').option('-v, --verbose', 'detailed output');
program.command('greet <name>').action(name => console.log('Hello, ' + name + '! Group 477 welcomes you.'));
program.command('info').action(() => console.log('Student: Zubelik Trofim Alekseevich\nGroup: 477\nLaboratory work: 17\nDate: ' + new Date().toISOString()));
program.command('generate').option('-t, --type <type>', 'html, pdf, json, csv', 'html').option('-o, --output <path>').option('-f, --force').option('--dry-run').action(async options => {
  if (!['html', 'pdf', 'json', 'csv'].includes(options.type)) throw new Error('Invalid report type');
  const output = options.output || 'output.' + options.type;
  if (program.opts().verbose) console.log('Generating ' + options.type + ' report');
  if (options.dryRun) return console.log('[DRY-RUN] Would write ' + output);
  const data = { student: 'Zubelik Trofim Alekseevich', group: '477', lab: 17 };
  if (options.type === 'pdf') {
    const stream = createWriteStream(output, { flags: options.force ? 'w' : 'wx' });
    const done = finished(stream);
    const doc = new PDFDocument();
    doc.pipe(stream); doc.text(JSON.stringify(data, null, 2)); doc.end(); await done;
  } else {
    const formats = { html: '<h1>Laboratory Work 17</h1><p>Group 477</p>', json: JSON.stringify(data, null, 2), csv: 'student,group,lab\nZubelik Trofim Alekseevich,477,17\n' };
    await fs.writeFile(output, formats[options.type], { flag: options.force ? 'w' : 'wx' });
  }
  console.log('Report saved: ' + output);
});
program.command('convert <input>').requiredOption('-o, --output <path>').action(async (input, options) => {
  const content = await fs.readFile(input, 'utf8');
  await fs.writeFile(options.output, content.toUpperCase(), { flag: 'wx' });
  console.log('Converted: ' + options.output);
});
program.command('init').option('-n, --name <name>').option('-t, --type <type>').option('--typescript').option('--eslint').option('--prettier').option('--jest').option('--git').option('--no-interactive').action(async options => {
  if (!process.stdin.isTTY && !options.name) {
    let input = ''; for await (const chunk of process.stdin) input += chunk;
    options.name = input.trim();
  }
  let answers = {};
  if ((!options.name || !options.type) && options.interactive && process.stdin.isTTY) {
    answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Project name:', when: !options.name, validate: value => value.trim() ? true : 'Name is required' },
      { type: 'list', name: 'type', message: 'Project type:', choices: ['web', 'cli', 'library', 'microservice'], when: !options.type },
      { type: 'checkbox', name: 'features', message: 'Features:', choices: ['typescript', 'eslint', 'prettier', 'jest'] },
      { type: 'confirm', name: 'git', message: 'Use Git?', default: true },
      { type: 'password', name: 'token', message: 'Access token (optional):', mask: '*' }
    ]);
  }
  const name = options.name || answers.name;
  const type = options.type || answers.type;
  if (!name || !type) throw new Error('--name and --type are required in non-interactive mode');
  if (!['web', 'cli', 'library', 'microservice'].includes(type)) throw new Error('Invalid project type');
  const features = answers.features || ['typescript', 'eslint', 'prettier', 'jest'].filter(key => options[key]);
  console.log('Project initialized: ' + name + '\nType: ' + type + '\nFeatures: ' + features.join(', ') + '\nGit: ' + Boolean(options.git || answers.git));
});
if (process.argv.length === 2) program.outputHelp();
else program.parseAsync().catch(error => { console.error('Error: ' + error.message); process.exitCode = 1; });
