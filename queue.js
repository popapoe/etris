class Queue {
	constructor(history) {
		this.history = history;
		this.queue = [];
		this.generator = generate_piss();
	}
	take() {
		let piss = this.peek(0);
		this.history.do(
			() => {
				this.queue.splice(0, 1);
			},
			() => {
				this.queue.splice(0, 0, piss);
			},
		);
		return piss;
	}
	peek(index) {
		while(index >= this.queue.length) {
			this.queue.push(this.generator.next().value);
		}
		return this.queue[index];
	}
}

function* generate_piss() {
	let bag;
	while(true) {
		bag = [
			"stick",
			"sun",
			"t piss",
			"right snake",
			"inverse skew",
			"gamma",
			"right gun",
			"e piss",
		];
		while(bag.length !== 0) {
			let index = 0 | (Math.random() * bag.length);
			yield bag[index];
			bag[index] = bag[bag.length - 1];
			bag.pop();
		}
		bag = [
			"stick",
			"sun",
			"t piss",
			"right snake",
			"inverse skew",
			"gamma",
			"right gun",
			"g piss",
		];
		while(bag.length !== 0) {
			let index = 0 | (Math.random() * bag.length);
			yield bag[index];
			bag[index] = bag[bag.length - 1];
			bag.pop();
		}
	}
}
