class PriorityQueue {
	constructor(compare) {
		this.heap = [];
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
		this.heap[0] = this.heap[this.heap.length - 1];
		this.heap.pop();
		if(this.heap.length !== 0) {
			this.sift_down(0);
		}
		return entry;
	}
	insert(entry) {
		let index = this.heap.length;
		this.heap.push(entry);
		this.sift_up(index);
	}
	sift_up(index) {
		while(true) {
			let parent = index >> 1;
			if(this.compare(this.heap[index], this.heap[parent]) < 0) {
				let temporary = this.heap[index];
				this.heap[index] = this.heap[parent];
				this.heap[parent] = temporary;
				index = parent;
			} else {
				break;
			}
		}
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
				let temporary = this.heap[index];
				this.heap[index] = this.heap[child];
				this.heap[child] = temporary;
				index = child;
			} else {
				break;
			}
		}
	}
}
