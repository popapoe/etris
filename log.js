class Log {
	constructor() {
		this.last = new LogStart();
	}
	add(message) {
		let node = new LogNode(message);
		this.last.next = node;
		this.last = node;
	}
	read() {
		return new LogReader(this.last);
	}
}

class LogReader {
	constructor(node) {
		this.node = node;
	}
	* catch_up() {
		while(this.node.next !== null) {
			this.node = this.node.next;
			yield this.node.message;
		}
	}
}

class LogStart {
	constructor() {
		this.next = null;
	}
}

class LogNode {
	constructor(message) {
		this.message = message;
		this.next = null;
	}
}
