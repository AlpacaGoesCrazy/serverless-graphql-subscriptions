module.exports = {
	"env": {
		"node": true,
		"commonjs": true,
		"es6": true,
		"mocha": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"sourceType": "module",
		"ecmaVersion": 2018
	},
	"rules": {
		"indent": [
			"error",
			"tab",
			{ "SwitchCase": 1 }
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"single"
		],
		"semi": [
			"error",
			"never"
		],
		"no-console": "error",
	}
};
