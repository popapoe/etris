class PriorityQueue {
	constructor(compare) {
		this.heap = [];
		this.keys = [];
		this.compare = compare;
	}
	size() {
		return this.heap.length;
	}
	peek(target) {
		return this.heap[0];
	}
	extract() {
		let entry = this.heap[0];
		let key = this.keys[0];
		this.heap[0] = this.heap[this.heap.length - 1];
		this.keys[0] = this.keys[this.keys.length - 1];
		this.keys[0].index = 0;
		key.index = -1;
		this.heap.pop();
		this.keys.pop();
		if(this.heap.length !== 0) {
			this.sift_down(0);
		}
		return entry;
	}
	insert(entry) {
		let index = this.heap.length;
		let key = new PriorityQueueKey(index);
		this.heap.push(entry);
		this.keys.push(key);
		this.sift_up(index);
		return key;
	}
	delete(key) {
		let index = key.index;
		let entry = this.heap[index];
		this.heap[index] = this.heap[this.heap.length - 1];
		this.keys[index] = this.keys[this.keys.length - 1];
		this.keys[index].index = index;
		key.index = -1;
		this.heap.pop();
		this.keys.pop();
		if(index < this.heap.length) {
			this.sift_down(this.sift_up(index));
		}
	}
	sift_up(index) {
		while(true) {
			let parent = index >> 1;
			if(this.compare(this.heap[index], this.heap[parent]) < 0) {
				let temporary_entry = this.heap[index];
				this.heap[index] = this.heap[parent];
				this.heap[parent] = temporary_entry;
				let temporary_key = this.keys[index];
				this.keys[index] = this.keys[parent];
				this.keys[parent] = temporary_key;
				this.keys[index].index = index;
				this.keys[parent].index = parent;
				index = parent;
			} else {
				break;
			}
		}
		return index;
	}
	sift_down(index) {
		while(true) {
			let left = index << 1;
			let right = index << 1 | 1;
			if(left >= this.heap.length) {
				break;
			}
			let child = left;
			if(right < this.heap.length && this.compare(this.heap[left], this.heap[right]) > 0) {
				child = right;
			}
			if(this.compare(this.heap[index], this.heap[child]) > 0) {
				let temporary_entry = this.heap[index];
				this.heap[index] = this.heap[child];
				this.heap[child] = temporary_entry;
				let temporary_key = this.keys[index];
				this.keys[index] = this.keys[child];
				this.keys[child] = temporary_key;
				this.keys[index].index = index;
				this.keys[child].index = child;
				index = child;
			} else {
				break;
			}
		}
		return index;
	}
}

class PriorityQueueKey {
	constructor(index) {
		this.index = index;
	}
}
