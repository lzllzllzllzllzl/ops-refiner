
module.exports = {
	root: true,
	env: {
		node: true,
		browser: true, // 添加浏览器环境
		es2021: true, // 添加ES2021环境
	},
	extends: [
		'eslint:recommended',
		'plugin:react/recommended', // 使用React推荐的规则
		'airbnb', // 使用Airbnb的ESLint配置
		'plugin:@typescript-eslint/recommended', // 使用TypeScript推荐的规则
	],
	plugins: [
		'@typescript-eslint',
		'react', // 添加React插件
		'react-hooks',
	],
	rules: {
		'no-underscore-dangle': 'off',
		'no-plusplus': 'off',
		'react/jsx-props-no-spreading': 'off',
		'class-methods-use-this': 'off',
		'no-console': ['error', { allow: ['warn', 'error'] }],
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'@typescript-eslint/no-unused-vars': ['error', { args: 'after-used' }],
		'no-shadow': 'off',
		'no-param-reassign': 'off',
		'space-before-function-paren': ['error', 'never'],
		'comma-dangle': ['error', 'always-multiline'],
		'array-bracket-newline': ['error', { multiline: true, minItems: 3 }],
		'spaced-comment': ['warn', 'always'],
		'require-await': 'error',
		semi: [2, 'always'],
		'import/no-relative-packages': 'off',
		'max-len': ['warn', { code: 120 }],
		'lines-between-class-members': 'off',
		'import/prefer-default-export': 'off',
		quotes: ['error', 'single'],
		'prefer-destructuring': [
			'error', {
				VariableDeclarator: {
					array: true,
					object: true,
				},
				AssignmentExpression: {
					array: false,
					object: false,
				},
			}, {
				enforceForRenamedProperties: false,
			},
		],
		'@typescript-eslint/lines-between-class-members': 'error',
		'@typescript-eslint/no-shadow': ['error'],
		'@typescript-eslint/ban-types': ['error'],
		'@typescript-eslint/no-empty-interface': ['error'],
		'@typescript-eslint/no-misused-new': ['error'],
		'@typescript-eslint/no-extra-non-null-assertion': ['error'],
		'@typescript-eslint/no-non-null-asserted-optional-chain': ['error'],
		'@typescript-eslint/no-non-null-assertion': ['error'],
		'@typescript-eslint/no-unnecessary-type-constraint': ['error'],
		'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }], // 允许在.tsx文件中使用JSX
		'react/react-in-jsx-scope': 'off', // React 17+不需要在作用域中引入React
		'import/extensions': false,
		'import/no-unresolved': 'off',
		// 'react/require-default-props': [
		//   1, {
		//     functions: 'ignore',
		//   },
		// ],
		'react/require-default-props': 'off',
		'react/no-unused-prop-types': 'off',
		// 检查 Hooks 的使用规则
		'react-hooks/rules-of-hooks': 'error',
		// 检查依赖项的声明
		'react-hooks/exhaustive-deps': 'error',
	},
	parserOptions: {
		ecmaFeatures: {
			jsx: true, // 允许解析JSX
		},
		ecmaVersion: 12, // 使用最新的ECMAScript版本
		sourceType: 'module',
		parser: '@typescript-eslint/parser',
	},
	settings: {
		react: {
			version: 'detect', // 自动检测React版本
		},
		'import/resolver': {
			node: {
				extensions: [
					'.js', '.jsx', '.ts', '.tsx',
				],
			},

		},
	},
};