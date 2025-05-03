class Game {
	constructor(history) {
		this.history = history;
		this.board = new Board(history);
		this.queue = new Queue(history);
		this.log = new Log();
		this.held = "empty";
		this.piss = "empty";
		this.piss_x = 0;
		this.piss_y = 0;
		this.piss_orientation = "0";
		this.is_spin = false;
		this.over = false;
		this.next();
	}
	is_piss_inside(piss_x, piss_y, piss_orientation) {
		for(let [ offset_x, offset_y ] of get_offsets(this.piss, piss_orientation)) {
			let x = piss_x + offset_x;
			let y = piss_y + offset_y;
			if(this.board.is_set(x, y)) {
				return true;
			}
		}
		return false;
	}
	spawn(piss) {
		let old_piss = this.piss;
		let old_piss_x = this.piss_x;
		let old_piss_y = this.piss_y;
		let old_piss_orientation = this.piss_orientation;
		let old_is_spin = this.is_spin;
		let old_over = this.over;
		this.history.do(
			() => {
				this.piss = piss;
				this.piss_x = 4;
				this.piss_y = 19;
				this.piss_orientation = "0";
				this.is_spin = false;
				if(this.is_piss_inside(this.piss_x, this.piss_y, this.piss_orientation)) {
					this.log.add("Over");
					this.over = true;
				}
			},
			() => {
				this.piss = old_piss;
				this.piss_x = old_piss_x;
				this.piss_y = old_piss_y;
				this.piss_orientation = old_piss_orientation;
				this.is_spin = old_is_spin;
				this.over = old_over;
			},
		);
	}
	next() {
		this.spawn(this.queue.take());
	}
	hold() {
		if(this.held === "empty") {
			this.history.do(
				() => {
					this.held = this.piss;
				},
				() => {
					this.held = "empty";
				},
			);
			this.next();
		} else {
			let old_held = this.held;
			this.history.do(
				() => {
					this.held = this.piss;
				},
				() => {
					this.held = old_held;
				},
			);
			this.spawn(old_held);
		}
	}
	left() {
		if(!this.is_piss_inside(this.piss_x - 1, this.piss_y, this.piss_orientation)) {
			let old_is_spin = this.is_spin;
			this.history.do(
				() => {
					this.piss_x--;
					this.is_spin = false;
				},
				() => {
					this.piss_x++;
					this.is_spin = old_is_spin;
				},
			);
			return true;
		} else {
			return false;
		}
	}
	right() {
		if(!this.is_piss_inside(this.piss_x + 1, this.piss_y, this.piss_orientation)) {
			let old_is_spin = this.is_spin;
			this.history.do(
				() => {
					this.piss_x++;
					this.is_spin = false;
				},
				() => {
					this.piss_x--;
					this.is_spin = old_is_spin;
				},
			);
			return true;
		} else {
			return false;
		}
	}
	down() {
		if(!this.is_piss_inside(this.piss_x, this.piss_y - 1, this.piss_orientation)) {
			let old_is_spin = this.is_spin;
			this.history.do(
				() => {
					this.piss_y--;
					this.is_spin = false;
				},
				() => {
					this.piss_y++;
					this.is_spin = old_is_spin;
				},
			);
			return true;
		} else {
			return false;
		}
	}
	rotate_cw() {
		let old_orientation = this.piss_orientation;
		let new_orientation = rotate_cw(this.piss_orientation);
		for(let [ kick_x, kick_y ] of get_kicks(this.piss, old_orientation, new_orientation)) {
			if(!this.is_piss_inside(this.piss_x + kick_x, this.piss_y + kick_y, new_orientation)) {
				let old_is_spin = this.is_spin;
				this.history.do(
					() => {
						this.is_spin = true;
						this.piss_x += kick_x;
						this.piss_y += kick_y;
						this.piss_orientation = new_orientation;
					},
					() => {
						this.is_spin = old_is_spin;
						this.piss_x -= kick_x;
						this.piss_y -= kick_y;
						this.piss_orientation = old_orientation;
					},
				);
				return;
			}
		}
	}
	rotate_ccw() {
		let old_orientation = this.piss_orientation;
		let new_orientation = rotate_ccw(this.piss_orientation);
		for(let [ kick_x, kick_y ] of get_kicks(this.piss, old_orientation, new_orientation)) {
			if(!this.is_piss_inside(this.piss_x + kick_x, this.piss_y + kick_y, new_orientation)) {
				let old_is_spin = this.is_spin;
				this.history.do(
					() => {
						this.is_spin = true;
						this.piss_x += kick_x;
						this.piss_y += kick_y;
						this.piss_orientation = new_orientation;
					},
					() => {
						this.is_spin = old_is_spin;
						this.piss_x -= kick_x;
						this.piss_y -= kick_y;
						this.piss_orientation = old_orientation;
					},
				);
				return;
			}
		}
	}
	rotate_180() {
		let old_orientation = this.piss_orientation;
		let new_orientation = rotate_180(this.piss_orientation);
		for(let [ kick_x, kick_y ] of get_kicks(this.piss, old_orientation, new_orientation)) {
			if(!this.is_piss_inside(this.piss_x + kick_x, this.piss_y + kick_y, new_orientation)) {
				let old_is_spin = this.is_spin;
				this.history.do(
					() => {
						this.is_spin = true;
						this.piss_x += kick_x;
						this.piss_y += kick_y;
						this.piss_orientation = new_orientation;
					},
					() => {
						this.is_spin = old_is_spin;
						this.piss_x -= kick_x;
						this.piss_y -= kick_y;
						this.piss_orientation = old_orientation;
					},
				);
				return;
			}
		}
	}
	get_ghost_y() {
		let ghost_y = -Infinity;
		for(let [ offset_x, offset_y ] of get_offsets(this.piss, this.piss_orientation)) {
			let x = this.piss_x + offset_x;
			let y = this.board.get_height(x, this.piss_y + offset_y) - offset_y;
			if(y > ghost_y) {
				ghost_y = y;
			}
		}
		return ghost_y;
	}
	drop() {
		let old_piss_y = this.piss_y;
		let old_is_spin = this.is_spin;
		let new_piss_y = this.get_ghost_y();
		let new_is_spin = this.is_spin && new_piss_y === old_piss_y;
		this.history.do(
			() => {
				this.piss_y = new_piss_y;
				this.is_spin = new_is_spin;
			},
			() => {
				this.piss_y = old_piss_y;
				this.is_spin = old_is_spin;
			},
		);
	}
	lock() {
		for(let [ offset_x, offset_y ] of get_offsets(this.piss, this.piss_orientation)) {
			let x = this.piss_x + offset_x;
			let y = this.piss_y + offset_y;
			if(this.piss === "g piss") {
				this.board.set_cell_g_piss(x, y);
			} else {
				this.board.set_cell_other(x, y, this.piss);
			}
		}
		let bottom = this.piss_y + get_bottom_offset(this.piss, this.piss_orientation);
		let top = this.piss_y + get_top_offset(this.piss, this.piss_orientation);
		let clears = [];
		for(let y = top; y >= bottom; y--) {
			if(this.board.row_fill[y] === 10) {
				clears.push(y);
			}
		}
		if(this.is_spin && (this.piss === "t piss" || this.piss === "e piss")) {
			let filled_corners = 0;
			for(let offset_x of [ -1, 1 ]) {
				for(let offset_y of [ -1, 1 ]) {
					let x = this.piss_x + offset_x;
					let y = this.piss_y + offset_y;
					if(this.board.is_set(x, y)) {
						filled_corners++;
					}
				}
			}
			let column_clear_count = 0;
			if(this.piss === "e piss") {
				for(let [ offset_x, offset_y ] of get_offsets(this.piss, this.piss_orientation)) {
					let x = this.piss_x + offset_x;
					let y = this.piss_y + offset_y;
					if(this.board.clear_column(x, y)) {
						column_clear_count++;
					}
				}
			}
			if(filled_corners >= 3) {
				this.log.add(`You ${this.piss} SPINNED ${clears.length + column_clear_count} linees`);
			}
		} else {
			if(this.piss === "e piss") {
				for(let [ offset_x, offset_y ] of get_offsets(this.piss, this.piss_orientation)) {
					let x = this.piss_x + offset_x;
					let y = this.piss_y + offset_y;
					this.board.clear_column(x, y);
				}
			}
		}
		for(let y of clears) {
			this.board.clear_row(y);
		}
		if(this.board.fill === 0) {
			this.log.add("You perfect cleared");
		}
	}
}
