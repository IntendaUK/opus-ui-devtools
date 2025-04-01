import prettier from 'eslint-plugin-prettier';

export default [
	{
		languageOptions: {
			ecmaVersion: 2021, // Equivalent to "es6": true
			sourceType: 'module',
			globals: {
				Event: 'readonly',
				EventTarget: 'readonly',
				FormData: 'readonly',
				Map: 'writable',
				Promise: 'writable',
				Set: 'writable',
				XMLHttpRequest: 'readonly',
				__DEV__: 'writable',
				__dirname: 'readonly',
				__fbBatchedBridgeConfig: 'readonly',
				alert: 'readonly',
				cancelAnimationFrame: 'readonly',
				cancelIdleCallback: 'readonly',
				clearImmediate: 'writable',
				clearInterval: 'readonly',
				clearTimeout: 'readonly',
				console: 'readonly',
				document: 'readonly',
				escape: 'readonly',
				exports: 'readonly',
				fetch: 'readonly',
				global: 'readonly',
				jest: 'readonly',
				module: 'readonly',
				navigator: 'readonly',
				pit: 'readonly',
				process: 'readonly',
				requestAnimationFrame: 'writable',
				requestIdleCallback: 'writable',
				require: 'readonly',
				setImmediate: 'writable',
				setInterval: 'readonly',
				setTimeout: 'readonly',
				window: 'readonly',
				isMobile: 'readonly'
			}
		},
		plugins: { prettier },
		rules: {
			'arrow-parens': ['error', 'as-needed'],
			'arrow-spacing': ['error', {
				after: true,
				before: true
			}],
			'block-scoped-var': 'error',
			'brace-style': ['error', '1tbs'],
			'comma-dangle': ['error', 'never'],
			'comma-spacing': ['error', { after: true }],
			'comma-style': 'error',
			complexity: ['error', { max: 13 }],
			curly: ['error', 'multi-or-nest'],
			'dot-location': ['error', 'property'],
			'dot-notation': 'error',
			'eol-last': 'error',
			eqeqeq: ['error', 'smart'],
			'func-style': ['warn', 'expression'],
			indent: ['error', 'tab', { ignoredNodes: ['TemplateLiteral'] }],
			'key-spacing': ['error', { afterColon: true }],
			'keyword-spacing': ['error', {
				after: true,
				before: true
			}],
			'max-len': ['error', {
				code: 100,
				tabWidth: 1
			}],
			'max-lines': [
				'error',
				{
					max: 150,
					skipBlankLines: true,
					skipComments: true
				}
			],
			'max-lines-per-function': [
				'error',
				{
					max: 32,
					skipBlankLines: true,
					skipComments: true
				}
			],
			'new-parens': 'error',
			'no-alert': 'error',
			'no-caller': 'error',
			'no-catch-shadow': 'error',
			'no-cond-assign': ['error', 'always'],
			'no-console': [
				'error',
				{ allow: ['warn', 'error'] }
			],
			'no-const-assign': 'error',
			'no-constant-condition': 'error',
			'no-control-regex': 'error',
			'no-debugger': 'warn',
			'no-delete-var': 'error',
			'no-dupe-args': 'error',
			'no-dupe-keys': 'error',
			'no-duplicate-case': 'error',
			'no-else-return': 'error',
			'no-empty': ['error', { allowEmptyCatch: true }],
			'no-empty-character-class': 'error',
			'no-eq-null': 'error',
			'no-eval': 'error',
			'no-ex-assign': 'error',
			'no-extend-native': 'error',
			'no-extra-semi': 'error',
			'no-fallthrough': 'error',
			'no-floating-decimal': 'error',
			'no-func-assign': 'error',
			'no-implied-eval': 'error',
			'no-inline-comments': 'error',
			'no-inner-declarations': ['error', 'functions'],
			'no-invalid-regexp': 'error',
			'no-irregular-whitespace': 'error',
			'no-iterator': 'error',
			'no-label-var': 'error',
			'no-labels': 'error',
			'no-lone-blocks': 'error',
			'no-lonely-if': 'error',
			'no-mixed-requires': ['error', false],
			'no-mixed-spaces-and-tabs': 'error',
			'no-multi-spaces': 'error',
			'no-multiple-empty-lines': ['error', { max: 1 }],
			'no-native-reassign': 'error',
			'no-negated-in-lhs': 'error',
			'no-nested-ternary': 'warn',
			'no-new': 'error',
			'no-new-func': 'error',
			'no-new-object': 'error',
			'no-new-require': 'error',
			'no-new-wrappers': 'error',
			'no-obj-calls': 'error',
			'no-octal': 'error',
			'no-octal-escape': 'error',
			'no-path-concat': 'error',
			'no-process-exit': 'warn',
			'no-proto': 'error',
			'no-redeclare': 'error',
			'no-regex-spaces': 'error',
			'no-return-assign': ['error', 'always'],
			'no-script-url': 'error',
			'no-self-compare': 'error',
			'no-sequences': 'error',
			'no-shadow': [
				'error',
				{
					builtinGlobals: false,
					hoist: 'all'
				}
			],
			'no-shadow-restricted-names': 'error',
			'no-spaced-func': 'error',
			'no-sparse-arrays': 'error',
			'no-throw-literal': 'error',
			'no-trailing-spaces': 'error',
			'no-undef': 'error',
			'no-undef-init': 'error',
			'no-underscore-dangle': 'warn',
			'no-unneeded-ternary': 'error',
			'no-unreachable': 'warn',
			'no-unused-expressions': 'error',
			'no-unused-vars': 'warn',
			'no-use-before-define': 'error',
			'no-useless-call': 'error',
			'no-var': 'error',
			'no-void': 'error',
			'no-with': 'error',
			'object-curly-newline': [
				'error',
				{
					ExportDeclaration: {
						minProperties: 2,
						multiline: true
					},
					ImportDeclaration: 'never',
					ObjectExpression: {
						minProperties: 2,
						multiline: true
					},
					ObjectPattern: { multiline: true }
				}
			],
			'object-curly-spacing': [
				'error',
				'always',
				{
					arraysInObjects: true,
					objectsInObjects: true
				}
			],
			'object-property-newline': 'error',
			'object-shorthand': 'error',
			'padded-blocks': ['error', 'never'],
			'padding-line-between-statements': [
				'error',
				{
					blankLine: 'always',
					next: 'return',
					prev: '*'
				}
			],
			'quote-props': ['error', 'as-needed'],
			quotes: ['error', 'single', { avoidEscape: true }],
			semi: ['error', 'always'],
			'semi-spacing': ['error', { after: true }],
			'space-before-blocks': ['error', 'always'],
			'space-before-function-paren': ['error', 'always'],
			'space-in-parens': 'error',
			'space-infix-ops': 'error',
			strict: ['error', 'global'],
			'template-curly-spacing': 'off',
			'use-isnan': 'error',
			'valid-typeof': 'error',
			'wrap-iife': ['error', 'inside'],
			yoda: ['error', 'never']
		},
		settings: { react: { version: 'detect' } }
	}
];
