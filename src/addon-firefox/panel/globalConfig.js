const globalConfig = {};

export const set = _globalConfig => {
	Object.assign(globalConfig, _globalConfig);
	console.log(globalConfig, _globalConfig);
};

export const getKey = key => {
	console.log(key, globalConfig);
	return globalConfig[key];
};
