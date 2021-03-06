'use strict';

const mapSymbols = {
	scaffold: '#',
	space: '.',
	newline: '\n',
	robotFacingUp: '^',
	robotFacingDown: 'v',
	robotFacingLeft: '<',
	robotFacingRight: '>',
	robotFacingImpendingDoom: 'X',
};

const rotationCommandSymbols = {
	turnRight: 'R',
	turnLeft: 'L',
};

const offsetFromOrientation = {
	up: { x:0, y:-1, },
	down: { x:0, y:1, },
	right: { x:1, y:0, },
	left: { x:-1, y:0, },
};

const buildVacuumRobot = (intcodeComputer, scaffoldMapper) => {
	const self = {
		intcodeComputer,
		scaffoldMapper,
		position: null,
		orientation: null,
		path: [],
	};

	const traverseScaffolds = buildTraverseScaffolds(self);

	const findNaivePathOverScaffold =
		buildFindNaivePathOverScaffold(self);

	const findRobotPositionAndOrientation =
		buildFindRobotPositionAndOrientation(self);

	const isNextTileScaffold
		= buildIsNextTileScaffold(self);

	const rotateRobot = buildRotateRobot(self);

	const breakdownPath =
		buildBreakdownPath();

	const followPath =
		buildFollowPath();

	const getDustCollected =
		buildGetDustCollected();

	return Object.assign(
		self,
		{ traverseScaffolds, },
		{ findNaivePathOverScaffold, },
		{ findRobotPositionAndOrientation, },
		{ isNextTileScaffold, },
		{ rotateRobot, },
		{ breakdownPath, },
		{ followPath, },
		{ getDustCollected, }
	);
};

const buildTraverseScaffolds = self => () => {
	self.scaffoldMapper.mapScaffolds();
	self.findNaivePathOverScaffold();
	self.breakdownPath();
	self.followPath();
};

const buildFindNaivePathOverScaffold = self => () => {
	self.findRobotPositionAndOrientation();
	while (true) {
		let tilesTravelled = 0;
		while (self.isNextTileScaffold()) {
			tilesTravelled += 1;
			const { x: xPosition, y: yPosition, } = self.position;
			const { x: xOffset, y: yOffset, } = self.orientation;
			self.position = {
				x: xPosition + xOffset,
				y: yPosition + yOffset,
			};
		}
		if (tilesTravelled > 0) {
			self.path.push(tilesTravelled.toString());
		}

		self.rotateRobot(rotationCommandSymbols.turnRight);
		if (self.isNextTileScaffold()) {
			self.path.push(rotationCommandSymbols.turnRight);
			continue;
		}

		self.rotateRobot(rotationCommandSymbols.turnLeft);
		self.rotateRobot(rotationCommandSymbols.turnLeft);
		if (self.isNextTileScaffold()) {
			self.path.push(rotationCommandSymbols.turnLeft);
			continue;
		}

		return;
	}
};

const buildFindRobotPositionAndOrientation = self => () => {
	const robotSymbolCodes = [
		mapSymbols.robotFacingImpendingDoom,
		mapSymbols.robotFacingUp,
		mapSymbols.robotFacingDown,
		mapSymbols.robotFacingLeft,
		mapSymbols.robotFacingRight,
	];

	const yMax = self.scaffoldMapper.scaffolds.length - 1;
	for (let y = 0; y <= yMax; y++) {
		const xMax = self.scaffoldMapper.scaffolds[y].length - 1;
		for (let x = 0; x <= xMax; x++) {
			const symbol = self.scaffoldMapper.scaffolds[y][x];
			if (robotSymbolCodes.includes(symbol)) {
				self.position = { x, y, };
				switch (symbol) {
				case mapSymbols.robotFacingUp:
					self.orientation = offsetFromOrientation.up;
					return;
				case mapSymbols.robotFacingDown:
					self.orientation = offsetFromOrientation.down;
					return;
				case mapSymbols.robotFacingRight:
					self.orientation = offsetFromOrientation.right;
					return;
				case mapSymbols.robotFacingLeft:
					self.orientation = offsetFromOrientation.left;
					return;
				case mapSymbols.robotFacingImpendingDoom:
					throw new Error('Robot is tumbling through space');
				default:
					throw new Error('Unknown robot symbol code');
				}
			}
		}
	}

	throw new Error('Robot not found');
};

const buildIsNextTileScaffold = self => () => {
	const nextTilePosition = {
		x: self.position.x + self.orientation.x,
		y: self.position.y + self.orientation.y,
	};

	const yMax = self.scaffoldMapper.scaffolds.length - 1;
	const xMax = self.scaffoldMapper.scaffolds[0].length - 1;

	if (nextTilePosition.x < 0 || nextTilePosition.x > xMax) {
		return false;
	}

	if (nextTilePosition.y < 0 || nextTilePosition.y > yMax) {
		return false;
	}

	const nextTileSymbol = self
		.scaffoldMapper
		.scaffolds[nextTilePosition.y][nextTilePosition.x];

	return nextTileSymbol === mapSymbols.scaffold;
};

const buildRotateRobot = self => rotationCommandSymbol => {
	if (rotationCommandSymbol === rotationCommandSymbols.turnLeft) {
		const { x, y, } = self.orientation;
		self.orientation = {
			x: y,
			y: -x,
		};
		if (Object.is(self.orientation.y, -0)) {
			self.orientation.y = 0;
		}
		return;
	}

	if (rotationCommandSymbol === rotationCommandSymbols.turnRight) {
		const { x, y, } = self.orientation;
		self.orientation = {
			x: -y,
			y: x,
		};
		if (Object.is(self.orientation.x, -0)) {
			self.orientation.x = 0;
		}
		return;
	}

	throw new Error('Unhandled rotation code');
};

const buildBreakdownPath = () => () => {};

const buildFollowPath = () => () => {};

const buildGetDustCollected = () => () => {};

module.exports = {
	buildVacuumRobot,
};