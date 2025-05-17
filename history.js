class History {
	constructor() {
		this.index = 0;
		this.forwards = [];
		this.backwards = [];
		this.piss_forwards = [];
		this.piss_backwards = [];
	}
	commit_first() {
		this.piss_forwards.length = 0;
		this.piss_backwards.length = 0;
	}
	commit() {
		this.forwards.length = this.index;
		this.backwards.length = this.index;
		this.forwards.push(this.piss_forwards);
		this.backwards.push(this.piss_backwards);
		this.index++;
		this.piss_forwards = [];
		this.piss_backwards = [];
	}
	rollback() {
		for(let index = this.piss_backwards.length - 1; index >= 0; index--) {
			this.piss_backwards[index]();
		}
		this.piss_forwards.length = 0;
		this.piss_backwards.length = 0;
	}
	do(forward, backward) {
		this.piss_forwards.push(forward);
		this.piss_backwards.push(backward);
		return forward();
	}
	is_at_start() {
		return this.index === 0;
	}
	is_at_end() {
		return this.index === this.forwards.length;
	}
	undo() {
		this.rollback();
		this.index--;
		let piss_backwards = this.backwards[this.index];
		for(let index = piss_backwards.length - 1; index >= 0; index--) {
			piss_backwards[index]();
		}
	}
	redo() {
		this.rollback();
		let piss_forwards = this.forwards[this.index];
		for(let index = 0; index < piss_forwards.length; index++) {
			piss_forwards[index]();
		}
		this.index++;
	}
}
