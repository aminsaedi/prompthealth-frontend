/**
 * Patches an Angular 9 compiler bug where addParseSpanInfo crashes
 * with "Cannot read property 'start' of undefined" during AOT compilation.
 * This is a known issue with certain template expressions.
 */
const fs = require('fs');
const path = require('path');

const diagPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@angular',
  'compiler-cli',
  'src',
  'ngtsc',
  'typecheck',
  'src',
  'diagnostics.js'
);

let code = fs.readFileSync(diagPath, 'utf8');

const original = `    function addParseSpanInfo(node, span) {
        var commentText;
        if (span instanceof compiler_1.AbsoluteSourceSpan) {
            commentText = span.start + "," + span.end;
        }
        else {
            commentText = span.start.offset + "," + span.end.offset;
        }
        ts.addSyntheticTrailingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, commentText, /* hasTrailingNewLine */ false);
    }`;

const patched = `    function addParseSpanInfo(node, span) {
        if (!span) return;
        var commentText;
        if (span instanceof compiler_1.AbsoluteSourceSpan) {
            commentText = span.start + "," + span.end;
        }
        else {
            if (!span.start) return;
            commentText = span.start.offset + "," + span.end.offset;
        }
        ts.addSyntheticTrailingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, commentText, /* hasTrailingNewLine */ false);
    }`;

if (code.includes('if (!span) return;')) {
  console.log('Already patched.');
  process.exit(0);
}

code = code.replace(original, patched);
fs.writeFileSync(diagPath, code);
console.log('Angular compiler patched successfully.');
