module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "ignorePatterns": ["package-lock.json", "package.json", "/data/*", "config.dev.js"],
    "rules": {
        "no-mixed-spaces-and-tabs": "error",
        "semi": ["error", "always", { "omitLastInOneLineBlock": true}],
        "indent": ["error", 4],
        "no-irregular-whitespace": "error",
        "no-multiple-empty-lines": ["error" ,{"max":1}],
        "no-empty": ["error", { "allowEmptyCatch": true }],
        "no-trailing-spaces": "error"
    }
};
