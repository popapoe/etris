class Board {
	constructor(history) {
		this.history = history;
		this.cells = [];
		this.row_fill = [];
		this.columns = [];
		this.g_piss = [];
		this.fill = 0;
		for(let y = 0; y < 20; y++) {
			this.cells.push([]);
			this.row_fill.push(0);
			for(let x = 0; x < 10; x++) {
				this.cells[y].push("empty");
			}
		}
		for(let x = 0; x < 10; x++) {
			this.columns.push(0);
			this.g_piss.push(0);
		}
	}
	clear_row(y) {
		for(let x = 0; x < 10; x++) {
			let old_column = this.columns[x];
			let old_g_piss = this.g_piss[x];
			let new_column = remove_bit(this.columns[x], y);
			let new_g_piss = remove_bit(this.g_piss[x], y);
			this.history.do(
				() => {
					this.columns[x] = new_column;
					this.g_piss[x] = new_g_piss;
				},
				() => {
					this.columns[x] = old_column;
					this.g_piss[x] = old_g_piss;
				},
			);
		}
		let old_row = this.cells[y];
		let row = [];
		for(let x = 0; x < 10; x++) {
			row.push("empty");
		}
		let old_fill = this.row_fill[y];
		this.history.do(
			() => {
				this.cells.splice(y, 1);
				this.cells.push(row);
				this.row_fill.splice(y, 1);
				this.row_fill.push(0);
				this.fill -= 10;
			},
			() => {
				this.cells.pop();
				this.cells.splice(y, 0, old_row);
				this.row_fill.pop();
				this.row_fill.splice(y, 0, old_fill);
				this.fill += 10;
			},
		);
	}
	clear_column(x, y) {
		let bottom = 32 - Math.clz32(this.g_piss[x] & ~(-1 << y));
		let top = ctz32(~(this.columns[x] & ~this.g_piss[x]) & -1 << bottom);
		if(y >= top) {
			return false;
		}
		let mask = ~(-1 << top) & (-1 << bottom);
		let old_column = this.columns[x];
		let old_g_piss = this.g_piss[x];
		let new_column = this.columns[x] & ~mask;
		let new_g_piss = this.g_piss[x] & ~mask;
		this.history.do(
			() => {
				this.columns[x] = new_column;
				this.g_piss[x] = new_g_piss;
			},
			() => {
				this.columns[x] = old_column;
				this.g_piss[x] = old_g_piss;
			},
		);
		for(let y = bottom; y < top; y++) {
			let old_cell = this.cells[y][x];
			this.history.do(
				() => {
					this.cells[y][x] = "empty";
					this.row_fill[y]--;
					this.fill--;
				},
				() => {
					this.cells[y][x] = old_cell;
					this.row_fill[y]++;
					this.fill++;
				},
			);
		}
		return true;
	}
	unset_cell(x, y) {
		if(y >= 20) {
			return;
		}
		let old_cell = this.cells[y][x];
		let old_column = this.columns[x];
		let old_g_piss = this.g_piss[x];
		let new_column = this.columns[x] & ~(1 << y);
		let new_g_piss = this.g_piss[x] & ~(1 << y);
		this.history.do(
			() => {
				this.cells[y][x] = "empty";
				this.columns[x] = new_column;
				this.g_piss[x] = new_g_piss;
				this.row_fill[y]--;
				this.fill--;
			},
			() => {
				this.cells[y][x] = old_cell;
				this.columns[x] = old_column;
				this.g_piss[x] = old_g_piss;
				this.row_fill[y]++;
				this.fill++;
			},
		);
	}
	set_cell_g_piss(x, y) {
		if(y >= 20) {
			return;
		}
		let old_cell = this.cells[y][x];
		let old_column = this.columns[x];
		let old_g_piss = this.g_piss[x];
		let new_column = this.columns[x] | 1 << y;
		let new_g_piss = this.g_piss[x] | 1 << y;
		this.history.do(
			() => {
				this.cells[y][x] = "g piss";
				this.columns[x] = new_column;
				this.g_piss[x] = new_g_piss;
				this.row_fill[y]++;
				this.fill++;
			},
			() => {
				this.cells[y][x] = old_cell;
				this.columns[x] = old_column;
				this.g_piss[x] = old_g_piss;
				this.row_fill[y]--;
				this.fill--;
			},
		);
	}
	set_cell_other(x, y, piss) {
		if(y >= 20) {
			return;
		}
		let old_cell = this.cells[y][x];
		let old_column = this.columns[x];
		let old_g_piss = this.g_piss[x];
		let new_column = this.columns[x] | 1 << y;
		let new_g_piss = this.g_piss[x] | 1 << y;
		this.history.do(
			() => {
				this.cells[y][x] = piss;
				this.columns[x] = new_column;
				this.row_fill[y]++;
				this.fill++;
			},
			() => {
				this.cells[y][x] = old_cell;
				this.columns[x] = old_column;
				this.row_fill[y]--;
				this.fill--;
			},
		);
	}
	is_out(x, y) {
		return x < 0 || x >= 10 || y < 0;
	}
	is_set(x, y) {
		return this.is_out(x, y) || (this.columns[x] & 1 << y) !== 0;
	}
	get_height(x, y) {
		return 32 - Math.clz32(this.columns[x] & ~(-1 << y));
	}
}

function remove_bit(x, i) {
	return (x & -1 << i + 1) >> 1 | x & ~(-1 << i);
}

function ctz32(x) {
	if(x === 0) {
		return 32;
	} else {
		return 31 - Math.clz32(x & -x);
	}
}
