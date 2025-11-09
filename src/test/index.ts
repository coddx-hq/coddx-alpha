//
// PLEASE DO NOT MODIFY / DELETE UNLESS YOU KNOW WHAT YOU ARE DOING
//
// This file is providing the test runner to use when running extension tests.
// By default the test runner in use is Mocha based.

export function run(): Promise<void> {
    // Create the mocha test
    const mocha = new (require('mocha'))({
        ui: 'tdd',
        useColors: true,
        timeout: 100000,
    });

    const testsRoot = __dirname;

    return new Promise((c, e) => {
        const testFiles = require('glob').sync('**/**.test.js', { cwd: testsRoot });

        // Add files to the test suite
        testFiles.forEach((f: string) => mocha.addFile(require('path').resolve(testsRoot, f)));

        try {
            // Run the mocha test
            mocha.run((failures: number) => {
                if (failures > 0) {
                    e(new Error(`${failures} tests failed.`));
                } else {
                    c();
                }
            });
        } catch (err) {
            e(err);
        }
    });
}