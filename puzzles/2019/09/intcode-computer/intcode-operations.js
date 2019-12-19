const buildOperations = (self, operationCodes, parameterModeCodes) => {
	const getParamsValue = buildGetParamsValue(self, parameterModeCodes);

	return new Map([
		[operationCodes.add, handleAdd(self, getParamsValue),],
		[operationCodes.multiply, handleMultiply(self, getParamsValue),],
		[operationCodes.input, handleInput(self),],
		[operationCodes.output, handleOutput(self, getParamsValue),],
		[operationCodes.halt, handleHalt(self),],
	]);
};

const handleAdd = (self, getParamsValue)=> () => {
	const {
		software,
		instructionPtr,
	} = self;

	const [_, verb, noun, write,] = software.slice(instructionPtr);
	const [verbValue, nounValue,] = getParamsValue([verb, noun,]);

	const valueToWrite = parseInt(verbValue) + parseInt(nounValue);

	self.software[write] = valueToWrite.toString();
	self.instructionPtr += 4;
	return;
};

const handleMultiply = (self, getParamsValue)=> () => {
	const {
		software,
		instructionPtr,
	} = self;

	const [_, verb, noun, write,] = software.slice(instructionPtr);
	const [verbValue, nounValue,] = getParamsValue([verb, noun,]);

	const valueToWrite = parseInt(verbValue) * parseInt(nounValue);

	self.software[write] = valueToWrite.toString();
	self.instructionPtr += 4;
	return;
};

const handleInput = self=> () => {
	const {
		software,
		instructionPtr,
		inputQueue,
	} = self;

	const [_, write,] = software.slice(instructionPtr);
	const valueToWrite = inputQueue[0];

	self.software[write] = valueToWrite.toString();
	self.instructionPtr += 2;
	self.inputQueue.shift();
	return;
};

const handleOutput = (self, getParamsValue)=> () => {
	const {
		software,
		instructionPtr,
	} = self;

	const [_, verb,] = software.slice(instructionPtr);
	const [verbValue,] = getParamsValue([verb,]);

	self.instructionPtr += 2;
	self.outputHeap.push(verbValue);
	return;
};

const handleHalt = self=> () => {
	self.instructionPtr += 1;
	return;
};

const buildGetParamsValue = (self, parameterModeCodes) => params => {
	const {
		software,
		instructionPtr,
	} = self;

	let paramsModeCode = software[instructionPtr]
		.slice(0, -2)
		.split('')
		.reverse()
		.join('');
	paramsModeCode += parameterModeCodes.position.repeat(params.length);
	const paramsValue = [];

	for (let i = 0; i < params.length; i++) {
		const param = params[i];
		const paramModeCode = paramsModeCode[i];

		if (paramModeCode === parameterModeCodes.position) {
			paramsValue.push(software[param]);
			continue;
		}

		if (paramModeCode === parameterModeCodes.immediate) {
			paramsValue.push(param);
			continue;
		}

		throw new Error('Unhandled parameter mode code');
	}

	return paramsValue;
};

module.exports = {
	buildOperations,
};