const globalConfig = {};

export const set = _globalConfig => {
	Object.assign(globalConfig, _globalConfig);
};

export const getKey = key => globalConfig[key];
