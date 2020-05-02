const path = require('path');
const {
  Extractor,
  ExtractorConfig
} = require('@microsoft/api-extractor');

console.log(`
\x1b[36mRunning API Extractor\x1b[37m
`);

const extractorConfig = ExtractorConfig.loadFileAndPrepare(path.resolve(__dirname, './api-extractor.json'));

const extractorResult = Extractor.invoke(extractorConfig, {});

if (extractorResult.succeeded) {
  console.log('\x1b[32m', '\nAPI Extractor completed successfully');
} else {
  console.log(
  `\nAPI Extractor completed with ${extractorResult.errorCount} errors and ${extractorResult.warningCount} warnings`
  );
}
